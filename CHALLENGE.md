# Buenro - Tech assessment for Senior Backend Role

## Overview

Design a backend solution capable of ingesting multiple external datasets stored in JSON
format at regular intervals, storing them efficiently, and exposing the data via an API.

## Implementation Notes:
- Ingest data from multiple external JSON files stored in AWS S3 buckets. For example,
two sample JSONs are provided below.
- JSON file sizes may range from 1KB to 1GB.
- The choice of the persistence layer, indexing strategy, and data model is up to
you—ensure scalability and support for attribute-based querying.
- Store the data in a unified structure that allows flexible and efficient retrieval.
- Provide a single API endpoint that returns data from all ingested sources, with filtering
capabilities on any of the available attributes.

## Data to be ingested:

Source 1 (~200kb):

https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/structured_generated_data.json

```json
[
// ...
    {
        id: string, // some random numeric var with 6 digits,
        name: string, // "Any human readable property name",
        address: {
            country: string, // "some random country" ,
            city: string, // "Some random city name belonging to country generated above"
        },
        isAvailable: boolean,
        priceForNight: number // any digit between 100 and 1000
    }
// ...
]
```

Source 2 (~150MB)
https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/large_generated_data.json

```json
[
...
    {
        id: string, // "some string random generated name 8 unique characters",
        city: string, // "Some random city name"
        availability: boolean,
        priceSegment: string, // "random generated one of: high/medium/low"
        pricePerNight: number, // any digit between 100 and 1000
    }
...
]
```

## Core Tech Stack:
- TypeScript
- NestJS
- MongoDB

Other supporting technologies can be chosen at your discretion.

## What to deliver:

- Your code stored in any git compatible platform
- A brief explanation of how to run your solution and how would you extend your solution if
new external JSONs should be supported with diff data structure

## Key Evaluation Criteria:

- Architecture: Is the design clear, scalable, and maintainable?
- Data Modeling: Is the model easy to extend and maintain?
- Performance: Have potential performance bottlenecks been considered?
- Code Quality: Is the code logically structured and easy to understand? Can new data
sources be added with minimal changes?
- Filtering Logic: Does filtering work effectively across all attributes, including partial text
and numeric ranges?

## Time Expectation:

This task should be completable within 2–4 hours, emphasizing clear thinking, sound design
decisions, and implementation robustness over superficial polish.