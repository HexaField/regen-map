import { type FromSchema } from 'json-schema-to-ts'

import organizationsSchema from './organizations_schema-v1.0.0'
import peopleSchema from './people_schema-v0.1.0'

export type Organization = FromSchema<typeof organizationsSchema> & { profile_url: string }

export type Person = FromSchema<typeof peopleSchema>

export type Project = Organization

export const SchemasMurmurations = {
  organizations: organizationsSchema,
  people: peopleSchema
}

export const SchemaOrg = {
  memberOf: 'https://schema.org/memberOf', // person => organization | project => organization
  knows: 'https://schema.org/knows', // person => person
  maintainer: 'https://schema.org/maintainer', // person => project
  softwareRequirement: 'https://schema.org/softwareRequirement' // project => project
}
