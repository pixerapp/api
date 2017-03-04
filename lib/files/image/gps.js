/*
* This code is taken from http://stackoverflow.com/a/24411091/556678.
* Refer to https://en.wikipedia.org/wiki/Geotagging for more
* details.
* */
'use strict';

function getCoordinatesFromExif(/* GPSLatitude array */ GPSLatitude,
                                /* GPSLatitudeRef string */ GPSLatitudeRef,
                                /* GPSLongitude array */ GPSLongitude,
                                /* GPSLongitudeRef string */ GPSLongitudeRef) {
  return {
    lat: getGps(GPSLatitude, GPSLatitudeRef),
    lon: getGps(GPSLongitude, GPSLongitudeRef),
  };
}

function getGps(exifCoordinates, hemi) {
  const degrees = exifCoordinates.length > 0 ? parseFloat(gps2Num(exifCoordinates[0]), 10) : 0;
  const minutes = exifCoordinates.length > 1 ? parseFloat(gps2Num(exifCoordinates[1]), 10) : 0;
  const seconds = exifCoordinates.length > 2 ? parseFloat(gps2Num(exifCoordinates[2]), 10) : 0;
  const flip = (/w|s/i.test(hemi)) ? -1 : 1;
  
  return flip * (degrees + (minutes / 60) + (seconds / 3600));
}

function gps2Num(coordPart) {
  const parts = ('' + coordPart).split('/');

  if (parts.length <= 0) {
    return 0;
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return parts[0] / parts[1];
}

module.exports = {
  getCoordinatesFromExif,
};
