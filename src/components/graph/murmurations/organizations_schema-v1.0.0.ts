export default {
  $schema: 'https://json-schema.org/draft-07/schema#',
  $id: 'https://library.murmurations.network/v2/schemas/organizations_schema-v1.0.0',
  title: 'Group/Project/Organization Schema',
  description: 'A schema to add regenerative economy Groups, Projects and Organizations to the Murmurations Index',
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
      title: 'Group/Project/Organization Name',
      description: 'The full name of the group, project or organization',
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
      description: 'The familiar name of the group, project or organization',
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
      description:
        'The unique and definitive website address for the group (e.g., https://my-group.org or https://some-host.net/my-org)',
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
      title: 'Tags/Type',
      description: 'Keywords that describe the group such as its type, searchable in the Murmurations index',
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
    urls: {
      title: 'Other URLs',
      description: "URLs for the group's other websites, social media, etc.",
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
    description: {
      title: 'Description',
      description: 'A short description of the group',
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
    mission: {
      title: 'Mission/Purpose',
      description: 'A short statement of why the group exists and its goals',
      type: 'string',
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'mission', version: '1.0.0' },
        context: ['https://en.wikipedia.org/wiki/Mission_statement'],
        purpose:
          ':The mission describes the purpose of the entity: what kind of product or service it provides (for profit or not), its primary customers or market, and its geographical region of operation.'
      }
    },
    status: {
      title: 'Status',
      description: 'The current status of the group',
      type: 'string',
      enum: ['active', 'completed', 'cancelled', 'on_hold', 'in_planning'],
      enumNames: ['Active', 'Completed', 'Cancelled', 'On hold', 'In planning'],
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'status', version: '1.0.0' },
        purpose: 'Status defines the current state of a project, organization, event, etc.'
      }
    },
    full_address: {
      title: 'Full Address',
      description:
        'The complete address of the group in a single text field as you would write it on an envelope, including the street address, city, postal code, country, etc.',
      type: 'string',
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'full_address', version: '1.0.0' },
        context: ['https://schema.org/address'],
        purpose:
          'Address captures the complete physical address of an entity. It is used to identify the location of the entity (e.g., a street address or a virtual location in a metaverse).'
      }
    },
    country_iso_3166: {
      title: 'Country (2 letters)',
      description: 'The two-letter country code according to the ISO 3166-1 standard where the group is located',
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
      description: 'The geo-coordinates (latitude \u0026 longitude) of the primary location of the group',
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
    image: {
      title: 'Image/Logo',
      description: "An image URL (starting with https:// or http://) for the group's logo, preferably a square",
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
    header_image: {
      title: 'Header Image',
      description: 'The URL of a header image (normally 1500px wide and 500px high) starting with http:// or https://',
      type: 'string',
      maxLength: 2000,
      pattern: '^https?://.*',
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'header_image', version: '1.0.0' },
        context: ['https://schema.org/image'],
        purpose: 'An image used in the background of a header section for an organization, project, item, etc.'
      }
    },
    images: {
      title: 'Other images',
      description: 'URLs for other images (starting with https:// or http://)',
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
    rss: {
      title: 'RSS URL',
      description:
        'A URL (starting with https:// or http://) for the Really Simple Syndication feed for the group (usually found at a URL such as https://my-group.org/feed)',
      type: 'string',
      maxLength: 2000,
      pattern: '^https?://.*',
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'rss', version: '1.0.0' },
        context: ['https://en.wikipedia.org/wiki/RSS']
      }
    },
    relationships: {
      title: 'Relationships',
      description: 'A list of relationships between this group (the subject) and various other entities (objects)',
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
    },
    starts_at: {
      title: 'Start Date/Time',
      description: 'The date and time the group was created (as a Unix timestamp, e.g., 1651848477)',
      type: 'number',
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'starts_at', version: '1.0.0' },
        context: ['https://schema.org/startDate'],
        purpose:
          'A starting date and time for an entity (founding date, birth date), event, etc. To specify just the year, assume a date of 1 January at the beginning of the day (e.g., 1672531200 for Sun 01 Jan 2023 00:00:00 GMT+0000).'
      }
    },
    ends_at: {
      title: 'End Date/Time',
      description: 'The date and time the group ceased to exist (as a Unix timestamp, e.g., 1651848477)',
      type: 'number',
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'ends_at', version: '1.0.0' },
        context: ['https://schema.org/endDate'],
        purpose:
          'An ending date and time for an entity (closing date, death), event, etc. To specify just the year, assume a date of 1 January at the beginning of the day (e.g., 1672531200 for Sun 01 Jan 2023 00:00:00 GMT+0000).'
      }
    },
    contact_details: {
      title: 'Contact Details',
      description: 'The contact details for the group',
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
    geographic_scope: {
      title: 'Geographic Scope',
      description: "The geographic scope of the group is defined by the sphere of the group's activities",
      type: 'string',
      enum: ['local', 'regional', 'national', 'international'],
      enumNames: ['Local', 'Regional', 'National', 'International'],
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'geographic_scope', version: '1.0.0' },
        purpose:
          'An entity will generally have a scope in which it operates from a local up to a global range. An item will generally be available within a specific scope as well. For example, perishable food will be available in a local or possibly regional market, but not in a national or international market.'
      }
    },
    unique_id: {
      title: 'Unique ID',
      description: 'The unique identifier of the entity, optionally defined by the group recording/tracking the entity',
      type: 'string',
      metadata: {
        creator: {
          name: 'Murmurations Network',
          url: 'https://murmurations.network'
        },
        field: { name: 'unique_id', version: '1.0.0' },
        context: ['https://schema.org/identifier'],
        purpose:
          'The unique ID is an identifier applied to an entity by a group that wishes to keep track of the entity. For example, an association of businesses will apply a unique ID to each member business in order to identify them for internal purposes.'
      }
    }
  },
  required: ['linked_schemas', 'name'],
  metadata: {
    creator: {
      name: 'Murmurations Network',
      url: 'https://murmurations.network/'
    },
    schema: {
      name: 'organizations_schema-v1.0.0',
      purpose: 'To map Groups, Projects and Organizations within the regenerative economy',
      url: 'https://murmurations.network'
    }
  }
} as const
