// A lightweight EXIF parser focused on extracting GPS data.

// Helper function to convert rational (fraction) from EXIF to a decimal number
const convertDMSToDD = (dms: number[], ref: 'N' | 'S' | 'E' | 'W'): number => {
  const degrees = dms[0] || 0;
  const minutes = dms[1] || 0;
  const seconds = dms[2] || 0;
  let dd = degrees + minutes / 60 + seconds / 3600;

  if (ref === 'S' || ref === 'W') {
    dd = dd * -1;
  }
  return dd;
};

// Main function to parse the file and extract location
export const getExifLocation = (file: File): Promise<{ latitude: number; longitude: number } | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) {
        return resolve(null);
      }

      const view = new DataView(e.target.result as ArrayBuffer);

      // Check for JPEG marker and EXIF marker
      if (view.getUint16(0, false) !== 0xFFD8) {
        return resolve(null); // Not a valid JPEG
      }

      let offset = 2;
      const length = view.byteLength;
      let marker;

      while (offset < length) {
        if (view.getUint8(offset) !== 0xFF) {
            return resolve(null); // Not a valid marker
        }

        marker = view.getUint8(offset + 1);

        if (marker === 0xE1) { // APP1 marker for EXIF
          offset += 4;
          // Check for EXIF header
          if (view.getUint32(offset, false) !== 0x45786966) {
            return resolve(null);
          }

          const tiffOffset = offset + 6;
          let littleEndian: boolean;
          // Check TIFF header for byte order
          if (view.getUint16(tiffOffset) === 0x4949) {
            littleEndian = true; // "II" for Intel (little-endian)
          } else if (view.getUint16(tiffOffset) === 0x4D4D) {
            littleEndian = false; // "MM" for Motorola (big-endian)
          } else {
            return resolve(null);
          }

          const firstIFDOffset = view.getUint32(tiffOffset + 4, littleEndian);
          const gpsIFDPointer = findTag(view, tiffOffset, firstIFDOffset, littleEndian, 0x8825); // GPS Info IFD Pointer

          if (!gpsIFDPointer) {
            return resolve(null);
          }

          const gpsData = getGpsData(view, tiffOffset, gpsIFDPointer, littleEndian);
          if (gpsData.lat && gpsData.lng && gpsData.latRef && gpsData.lngRef) {
            const latitude = convertDMSToDD(gpsData.lat, gpsData.latRef as 'N' | 'S');
            const longitude = convertDMSToDD(gpsData.lng, gpsData.lngRef as 'E' | 'W');
            return resolve({ latitude, longitude });
          }
          return resolve(null);
        } else {
          offset += 2 + view.getUint16(offset + 2);
        }
      }
      return resolve(null); // No EXIF data found
    };

    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file);
  });
};

function findTag(view: DataView, tiffStart: number, dirStart: number, littleEndian: boolean, tag: number): number | null {
  const entries = view.getUint16(dirStart, littleEndian);
  for (let i = 0; i < entries; i++) {
    const entryOffset = dirStart + i * 12 + 2;
    if (view.getUint16(entryOffset, littleEndian) === tag) {
      return view.getUint32(entryOffset + 8, littleEndian) + tiffStart;
    }
  }
  return null;
}

function getGpsData(view: DataView, tiffStart: number, gpsDirStart: number, littleEndian: boolean) {
    const entries = view.getUint16(gpsDirStart, littleEndian);
    const gpsData: { [key: number]: any } = {};

    for (let i = 0; i < entries; i++) {
        const entryOffset = gpsDirStart + i * 12 + 2;
        const tag = view.getUint16(entryOffset, littleEndian);
        const format = view.getUint16(entryOffset + 2, littleEndian);
        const components = view.getUint32(entryOffset + 4, littleEndian);
        const valueOffset = view.getUint32(entryOffset + 8, littleEndian) + tiffStart;

        if (tag === 0x0001 || tag === 0x0003) { // GPSLatitudeRef, GPSLongitudeRef
            gpsData[tag] = String.fromCharCode(view.getUint8(valueOffset));
        } else if (tag === 0x0002 || tag === 0x0004) { // GPSLatitude, GPSLongitude
            const rationals: number[] = [];
            for (let j = 0; j < components; j++) {
                const num = view.getUint32(valueOffset + j * 8, littleEndian);
                const den = view.getUint32(valueOffset + j * 8 + 4, littleEndian);
                rationals.push(num / den);
            }
            gpsData[tag] = rationals;
        }
    }
    return { lat: gpsData[2], lng: gpsData[4], latRef: gpsData[1], lngRef: gpsData[3] };
}
