export default {
  $schema: 'https://json-schema.org/draft-07/schema#',
  $id: 'https://library.murmurations.network/v2/schemas/people_schema-v0.1.0',
  title: 'People Schema',
  description: 'A schema to add individuals in the regenerative economy to the Murmurations Index',
  type: 'object',
  properties: {
    linked_schemas: {
      title: 'Linked Schemas',
      description:
        'A list of schemas against which a profile must be validated (schema names must be alphanumeric with underscore(_) spacers and dash(-) semantic version separator, e.g., my_data_schema-v1.0.0)',
      type: 'array',
      items: {
        type: 'string',
        pattern: '^[a-z][a-z0-9_]{7,97}-v[0-9]+\\.[0-9]+\\.[0-9]+$'
      },
      minItems: 1,
      uniqueItems: true,
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'linked_schemas', version: '1.0.0' },
        purpose:
          'This field is required in all Murmurations schemas to ensure that a profile is valid and can be posted to the Index. It is the only required field in the default-v2.0.0 schema, which is the first schema used by the Index to process incoming profiles.'
      }
    },
    name: {
      title: 'Full Name',
      description: 'The full name of the person',
      type: 'string',
      maxLength: 200,
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'name', version: '1.0.0' },
        context: ['https://schema.org/name'],
        purpose:
          'The common name that is generally used to refer to the entity, organization, project, item, etc., which can be a living being, a legal entity, an object (real or virtual) or even a good or service.'
      }
    },
    nickname: {
      title: 'Nickname',
      description: 'The familiar name of the person',
      type: 'string',
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'nickname', version: '1.0.0' },
        purpose: 'The familiar name that is generally used to refer to the entity, organization, project or item.'
      }
    },
    primary_url: {
      title: 'Primary URL',
      description: 'The unique and definitive website address for the person (e.g., alice.net or some-host.net/alice)',
      type: 'string',
      maxLength: 2000,
      pattern: '^https?://.*',
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'primary_url', version: '1.0.0' },
        context: ['https://schema.org/identifier'],
        purpose:
          "The primary URL is used to identify the entity or item, and is usually its main website address or, if the entity doesn't have a website it can be a web page that is well-known to be linked to the entity (e.g. a Facebook page)."
      }
    },
    tags: {
      title: 'Tags / Skills',
      description: 'Keywords that describe the person, searchable in the Murmurations index',
      type: 'array',
      items: { type: 'string', maxLength: 100 },
      uniqueItems: true,
      minItems: 1,
      maxItems: 100,
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'tags', version: '1.0.0' },
        context: ['https://schema.org/keywords'],
        purpose:
          'Tags holds a list of unique keywords that are used to describe any aspect of the entity, such that there is enough information to fit the entity into a variety of data taxonomies.'
      }
    },
    description: {
      title: 'Description/Bio',
      description: 'A short description or biography of the person',
      type: 'string',
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'description', version: '1.0.0' },
        context: ['http://schema.org/description'],
        purpose:
          'The Description field can be used to provided a description of the item, entity, organization, project, etc. We have chosen not to add a maximum length but aggregators may snip the first ~160 characters of this field to provide a summary in directory listings or maps, so make sure the first sentence provides a good overview of the entity you are describing.'
      }
    },
    image: {
      title: 'Photo/Avatar',
      description: 'An image URL (starting with https:// or http://), preferably a square',
      type: 'string',
      maxLength: 2000,
      pattern: '^https?://.*',
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'image', version: '1.0.0' },
        context: ['https://schema.org/image'],
        purpose: 'An image that is generally used to refer to the entity, organization, project, item, etc.'
      }
    },
    images: {
      title: 'Other Images',
      description: 'Other images (starting with https:// or http://) for this person',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            title: 'Image Name',
            description: 'Description of the image',
            type: 'string',
            maxLength: 100
          },
          url: {
            title: 'URL',
            description: 'A URL of the image starting with http:// or https://',
            type: 'string',
            maxLength: 2000,
            pattern: '^https?://.*'
          }
        },
        required: ['url']
      },
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'images', version: '1.0.0' },
        context: ['https://schema.org/image']
      }
    },
    urls: {
      title: 'Website Addresses/URLs',
      description: 'URLs for related website(s), RSS feeds, social media, etc.',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            title: 'URL Name',
            description: 'The name of what this URL is for (e.g., type of website such as work, personal, etc.)',
            type: 'string'
          },
          url: {
            title: 'URL',
            description: 'The URL (starting with http:// or https://) itself',
            type: 'string',
            maxLength: 2000,
            pattern: '^https?://.*'
          }
        },
        required: ['url']
      },
      uniqueItems: true,
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'urls', version: '1.0.0' },
        context: ['https://schema.org/url'],
        purpose:
          'URLs can be used to link the named entity to its presence on the web. For instance a group may link to informational sites and social media related to it. An individual may link to personal and work-related websites. In the case of an item or service, URLs can provide further information about them.'
      }
    },
    knows_language: {
      title: 'Languages Spoken',
      description: 'The languages a person can read, write and speak',
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      uniqueItems: true,
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'knows_language', version: '1.0.0' },
        context: ['https://schema.org/knowsLanguage'],
        purpose:
          'A list of languages spoken by a person or used in communication within and by an organization, group, etc.'
      }
    },
    contact_details: {
      title: 'Contact Details',
      description: "The person's contact details (fill in at least one)",
      type: 'object',
      properties: {
        email: {
          title: 'Email Address',
          description: 'A valid email address (public)',
          type: 'string'
        },
        contact_form: {
          title: 'Contact Form',
          description: 'A webpage (starting with https:// or http://) with a contact form',
          type: 'string',
          pattern: '^https?://.*'
        }
      },
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'contact_details', version: '1.0.0' },
        purpose: 'Provides a contact method for an entity.'
      }
    },
    telephone: {
      title: 'Telephone Number',
      description:
        'A landline or mobile phone number, specified in international dialing format (e.g., +1 212 555 1212)',
      type: 'string',
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'telephone', version: '1.0.0' },
        context: ['https://schema.org/telephone'],
        purpose:
          'A phone number that can be used to contact a person or organization. The number should be provided in international dialing format (e.g., the US telephone number (212) 555-1212 should be formatted as +1 212 555 1212).'
      }
    },
    street_address: {
      title: 'Street Address',
      description: 'The street address of the entity in a single text field as you would write it on an envelope',
      type: 'string',
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'street_address', version: '1.0.0' },
        context: ['https://schema.org/street_address'],
        purpose:
          'Street address captures the physical address of an entity, without the town/city, postal code, country, etc. This is useful for mapping and other applications where the full address is not required.'
      }
    },
    locality: {
      title: 'Locality',
      description: 'The locality (city, town, village, etc.) where the entity is located',
      type: 'string',
      maxLength: 100,
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'locality', version: '1.0.0' },
        context: ['https://schema.org/addressLocality']
      }
    },
    region: {
      title: 'Region',
      description: 'The region (state, county, province, etc.) where the entity is located',
      type: 'string',
      maxLength: 100,
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'region', version: '1.0.0' },
        context: ['https://schema.org/addressRegion']
      }
    },
    postal_code: {
      title: 'Postal Code',
      description: "The postal code for the entity's address",
      type: 'string',
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'postal_code', version: '1.0.0' },
        context: ['https://schema.org/postalCode'],
        purpose:
          'Postal code captures the code used by the local postal system of the entity. This is useful for mapping and other applications where the full address is not required.'
      }
    },
    country_name: {
      title: 'Country name',
      description: 'The name of country where the entity is based',
      type: 'string',
      maxLength: 100,
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'country_name', version: '1.0.0' },
        context: ['https://schema.org/Country'],
        purpose:
          "A free form field to enter a country's name. The Index will try to match that text to a country's name and will store the country's two-letter ISO-3166-1 code in the Index database to enable searching by country for the entity. The name-to-ISO mapping is here: https://github.com/MurmurationsNetwork/MurmurationsServices/blob/main/services/library/static/countries.json"
      }
    },
    country_iso_3166: {
      title: 'Country (2 letters)',
      description: 'The two-letter country code according to the ISO 3166-1 standard where the entity is located',
      type: 'string',
      enum: [
        'AD',
        'AE',
        'AF',
        'AG',
        'AI',
        'AL',
        'AM',
        'AO',
        'AQ',
        'AR',
        'AS',
        'AT',
        'AU',
        'AW',
        'AX',
        'AZ',
        'BA',
        'BB',
        'BD',
        'BE',
        'BF',
        'BG',
        'BH',
        'BI',
        'BJ',
        'BL',
        'BM',
        'BN',
        'BO',
        'BQ',
        'BR',
        'BS',
        'BT',
        'BV',
        'BW',
        'BY',
        'BZ',
        'CA',
        'CC',
        'CD',
        'CF',
        'CG',
        'CH',
        'CI',
        'CK',
        'CL',
        'CM',
        'CN',
        'CO',
        'CR',
        'CU',
        'CV',
        'CW',
        'CX',
        'CY',
        'CZ',
        'DE',
        'DJ',
        'DK',
        'DM',
        'DO',
        'DZ',
        'EC',
        'EE',
        'EG',
        'EH',
        'ER',
        'ES',
        'ET',
        'FI',
        'FJ',
        'FK',
        'FM',
        'FO',
        'FR',
        'GA',
        'GB',
        'GD',
        'GE',
        'GF',
        'GG',
        'GH',
        'GI',
        'GL',
        'GM',
        'GN',
        'GP',
        'GQ',
        'GR',
        'GS',
        'GT',
        'GU',
        'GW',
        'GY',
        'HK',
        'HM',
        'HN',
        'HR',
        'HT',
        'HU',
        'ID',
        'IE',
        'IL',
        'IM',
        'IN',
        'IO',
        'IQ',
        'IR',
        'IS',
        'IT',
        'JE',
        'JM',
        'JO',
        'JP',
        'KE',
        'KG',
        'KH',
        'KI',
        'KM',
        'KN',
        'KP',
        'KR',
        'KW',
        'KY',
        'KZ',
        'LA',
        'LB',
        'LC',
        'LI',
        'LK',
        'LR',
        'LS',
        'LT',
        'LU',
        'LV',
        'LY',
        'MA',
        'MC',
        'MD',
        'ME',
        'MF',
        'MG',
        'MH',
        'MK',
        'ML',
        'MM',
        'MN',
        'MO',
        'MP',
        'MQ',
        'MR',
        'MS',
        'MT',
        'MU',
        'MV',
        'MW',
        'MX',
        'MY',
        'MZ',
        'NA',
        'NC',
        'NE',
        'NF',
        'NG',
        'NI',
        'NL',
        'NO',
        'NP',
        'NR',
        'NU',
        'NZ',
        'OM',
        'PA',
        'PE',
        'PF',
        'PG',
        'PH',
        'PK',
        'PL',
        'PM',
        'PN',
        'PR',
        'PS',
        'PT',
        'PW',
        'PY',
        'QA',
        'RE',
        'RO',
        'RS',
        'RU',
        'RW',
        'SA',
        'SB',
        'SC',
        'SD',
        'SE',
        'SG',
        'SH',
        'SI',
        'SJ',
        'SK',
        'SL',
        'SM',
        'SN',
        'SO',
        'SR',
        'SS',
        'ST',
        'SV',
        'SX',
        'SY',
        'SZ',
        'TC',
        'TD',
        'TF',
        'TG',
        'TH',
        'TJ',
        'TK',
        'TL',
        'TM',
        'TN',
        'TO',
        'TR',
        'TT',
        'TV',
        'TW',
        'TZ',
        'UA',
        'UG',
        'UM',
        'US',
        'UY',
        'UZ',
        'VA',
        'VC',
        'VE',
        'VG',
        'VI',
        'VN',
        'VU',
        'WF',
        'WS',
        'YE',
        'YT',
        'ZA',
        'ZM',
        'ZW'
      ],
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'country_iso_3166', version: '1.0.0' },
        context: ['https://en.wikipedia.org/wiki/ISO_3166-1']
      }
    },
    geolocation: {
      title: 'Geolocation Coordinates',
      description: 'The geo-coordinates (latitude \u0026 longitude) of the primary location of the person',
      type: 'object',
      properties: {
        lat: {
          title: 'Latitude',
          description: 'A decimal amount between -90 and 90',
          type: 'number',
          minimum: -90,
          maximum: 90,
          metadata: {
            creator: {
              name: 'Murmurations Network',
              url: 'https://murmurations.network'
            },
            field: { name: 'latitude', version: '1.0.0' },
            context: ['https://schema.org/latitude']
          }
        },
        lon: {
          title: 'Longitude',
          description: 'A decimal amount between -180 and 180',
          type: 'number',
          minimum: -180,
          maximum: 180,
          metadata: {
            creator: {
              name: 'Murmurations Network',
              url: 'https://murmurations.network'
            },
            field: { name: 'longitude', version: '1.0.0' },
            context: ['https://schema.org/longitude']
          }
        }
      },
      required: ['lat', 'lon'],
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'geolocation', version: '1.0.0' },
        context: ['https://schema.org/latitude', 'https://schema.org/longitude', 'https://schema.org/GeoCoordinates']
      }
    },
    relationships: {
      title: 'Relationships',
      description: 'A list of relationships between this person (subject) and various other entities (objects)',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          predicate_url: {
            title: 'Predicate URL',
            description:
              'A URL defining the predicate of the relationship (e.g., https://schema.org/member or https://schema.org/knows)',
            type: 'string',
            maxLength: 2000,
            pattern: '^https?://.*'
          },
          object_url: {
            title: 'Object URL',
            description:
              'The URL (ideally the Primary URL) of the object of this relationship (must start with http:// or https://, e.g., https://alice.net)',
            type: 'string',
            maxLength: 2000,
            pattern: '^https?://.*'
          }
        },
        required: ['predicate_url', 'object_url']
      },
      uniqueItems: true,
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'relationships', version: '1.0.0' },
        purpose:
          'Relationships describe the links between a Subject and an Object. In a Murmurations profile the entity publishing these relationships is the Subject. The object_url should be the Primary URL of the receiving entity (e.g., https://alice.net), and the predicate should be a URL which defines the relationship the subject has with the object (e.g. https://schema.org/knows).'
      }
    }
  },
  required: ['linked_schemas', 'name', 'primary_url', 'tags'],
  metadata: {
    creator: {
      name: 'Murmurations Network',
      url: 'https://murmurations.network/'
    },
    schema: {
      name: 'people_schema-v0.1.0',
      purpose: 'To map people within the regenerative economy',
      url: 'https://murmurations.network'
    }
  }
} as const
