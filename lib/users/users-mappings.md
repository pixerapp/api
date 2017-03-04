
`keyword` type definition: https://www.elastic.co/guide/en/elasticsearch/reference/5.2/keyword.html


```json
{
  "settings" : {
    "index" : {
      "number_of_shards": 3,
      "number_of_replicas": 0
    }
  },
  "mappings": {
    "fb": {
      "properties": {
        "profileId": {
          "type": "keyword",
        }
      }
    },
    "profile": {
      "properties": {
        "name": {
          "type": "text"
        },
        "roAccess": {
          "type": "keyword"
        },
        "rwAccess": {
          "type": "keyword"
        }
      }
    }
  }
}
```

- `roAccess` for a list of access code that allow users to access other resources in read-only mode.
- `rwAccess` for a list of access code that allow users to access other resources in read-write mode.
