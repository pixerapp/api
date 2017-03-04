
```json
{
  "settings" : {
    "index" : {
      "number_of_shards": 3,
      "number_of_replicas": 0
    }
  },
  "mappings": {
    "image": {
      "properties": {
        "accessCodes": {
          "type": "keyword"
        },
        "ApertureValue": {
          "type": "half_float"
        },
        "bucketId": {
          "type": "keyword"
        },
        "channels": {
          "type": "short"
        },
        "ColorSpace": {
          "type": "integer"
        },
        "DateTimeDigitized": {
          "type": "date"
        },
        "DateTimeOriginal": {
          "type": "date"
        },
        "density": {
          "type": "integer"
        },
        "digest": {
          "type": "keyword",
          "doc_values": false
        },
        "digestAlgorithm": {
          "type": "keyword"
        },
        "DigitalZoomRatio": {
          "type": "half_float"
        },
        "encoding": {
          "type": "keyword"
        },
        "ExifVersion": {
          "type": "keyword"
        },
        "ExposureTime": {
          "type": "half_float"
        },
        "Flash": {
          "type": "byte"
        },
        "FNumber": {
          "type": "half_float"
        },
        "FocalLength": {
          "type": "half_float"
        },
        "format": {
          "type": "keyword"
        },
        "hasAlpha": {
          "type": "boolean"
        },
        "hasProfile": {
          "type": "boolean"
        },
        "height": {
          "type": "integer"
        },
        "ISO": {
          "type": "short"
        },
        "location": {
          "type": "geo_point"
        },
        "Make": {
          "type": "text",
          "fields": {
            "raw": { 
              "type":  "keyword"
            }
          }
        },
        "mimetype": {
          "type": "text",
          "fields": {
            "raw": { 
              "type":  "keyword"
            }
          }
        },
        "Model": {
          "type": "text",
          "fields": {
            "raw": { 
              "type":  "keyword"
            }
          }
        },
        "ModifyDate": {
          "type": "date"
        },
        "orientation": {
          "type": "byte"
        },
        "originalName": {
          "type": "text"
        },
        "requestId": {
          "type": "keyword",
          "doc_values": false
        },
        "requestStartTime": {
          "type": "date"
        },
        "ShutterSpeedValue": {
          "type": "half_float"
        },
        "size": {
          "type": "long"
        },
        "Software": {
          "type": "text",
          "fields": {
            "raw": { 
              "type":  "keyword"
            }
          }
        },
        "space": {
          "type": "keyword"
        },
        "url": {
          "type": "keyword",
          "doc_values": false
        },
        "width": {
          "type": "integer"
        }
      }
    }
  }
}
```

### Fields not available for sorting or aggregation

We will not perform sorting or aggregation on the following fields which is why we set `"doc_values": false` for them.

- `digest` - the SHA-1 value of the file; we will use this value for searching only (thus `"index": true`) with exactly value (thus `"type": "keyword"`).
- `requestId` - the ID of the request that uploaded this file; we may use this value for searching only (thus `"index": true`) with exactly value (thus `"type": "keyword"`).
- `url` - the URL in the cloud storage where the file is stored permanently; we may use this value for searching only (thus `"index": true`) with exactly value (thus `"type": "keyword"`).

### Access permissions

Each file has `accessCodes` property which is used to filter files which particular users have read-only or read-write access to.

## Exif metadata

References: http://www.exiv2.org/tags.html

- `ExposureProgram` http://www.awaresystems.be/imaging/tiff/tifftags/privateifd/exif/exposureprogram.html
- `ExposureTime` http://www.awaresystems.be/imaging/tiff/tifftags/privateifd/exif/exposuretime.html
- `FNumber` http://www.awaresystems.be/imaging/tiff/tifftags/privateifd/exif/fnumber.html
  http://www.december.com/john/photography/fnumber.html
