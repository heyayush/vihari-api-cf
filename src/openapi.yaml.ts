// src/openapi.yaml.ts

// IMPORTANT: Keep your actual openapi.yaml file updated separately.
// This string is a direct copy of your openapi.yaml content.
export const OPENAPI_YAML_CONTENT = `
openapi: 3.0.0
info:
  title: Customer Management API
  description: A Cloudflare Worker API for managing customer data, including CRUD operations, pagination, and searching.
  version: 1.0.0
servers:
  - url: https://your-worker-name.your-account.workers.dev/api # Replace with your deployed worker URL
    description: Production server
  - url: http://localhost:8787/api # Local development server
    description: Local development server

tags:
  - name: Customers
    description: Operations related to customer management

paths:
  /customers:
    get:
      tags:
        - Customers
      summary: Get a list of customers with limit, offset, and search
      operationId: listCustomers
      parameters:
        - in: query
          name: limit
          schema:
            type: integer
            default: 10
            minimum: 1
            maximum: 50 # Updated MAX_LIMIT
          description: Maximum number of customers to return (default 10, max 50)
        - in: query
          name: offset
          schema:
            type: integer
            default: 0
            minimum: 0
          description: The number of items to skip before starting to collect the result set
        - in: query
          name: search
          schema:
            type: string
          description: Search term for customer name, email, or project ID
      responses:
        200:
          description: A list of customers with total count, ordered by updated_at DESC.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedCustomerList'
        400:
          description: Invalid query parameters
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        500:
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
    post:
      tags:
        - Customers
      summary: Create a new customer
      operationId: createCustomer
      requestBody:
        description: Customer object to be created
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CustomerInput'
      responses:
        201:
          description: Customer created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Customer'
        400:
          description: Invalid input (e.g., missing required fields)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        500:
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /customers/{id}:
    get:
      tags:
        - Customers
      summary: Get a customer by ID
      operationId: getCustomerById
      parameters:
        - in: path
          name: id
          schema:
            type: integer
            format: int64
            minimum: 1
          required: true
          description: ID of the customer to retrieve
      responses:
        200:
          description: Customer found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Customer'
        400:
          description: Invalid ID supplied
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        404:
          description: Customer not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        500:
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
    patch: # Changed from put to patch
      tags:
        - Customers
      summary: Update an existing customer (partial update)
      operationId: updateCustomer
      parameters:
        - in: path
          name: id
          schema:
            type: integer
            format: int64
            minimum: 1
          required: true
          description: ID of the customer to update
      requestBody:
        description: Customer object with fields to update
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CustomerUpdateInput'
      responses:
        200:
          description: Customer updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Customer'
        400:
          description: Invalid ID or invalid update data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        404:
          description: Customer not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        500:
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
    delete:
      tags:
        - Customers
      summary: Soft or hard delete a customer
      operationId: deleteCustomer
      parameters:
        - in: path
          name: id
          schema:
            type: integer
            format: int64
            minimum: 1
          required: true
          description: ID of the customer to delete
        - in: query
          name: action
          schema:
            type: string
            enum: [soft, hard]
            default: soft
          description: Type of delete operation (soft deletes by default)
      responses:
        200:
          description: Customer deleted successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Customer with ID 1 soft-deleted successfully.
        400:
          description: Invalid ID or action
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        404:
          description: Customer not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        500:
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /openapi.yaml:
    get:
      summary: Retrieve the OpenAPI specification
      description: Serves the OpenAPI 3.0 specification for this API in YAML format.
      responses:
        200:
          description: OpenAPI specification file
          content:
            text/yaml:
              schema:
                type: string
                format: binary
        500:
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  schemas:
    Customer:
      type: object
      required:
        - id
        - project_id
        - name
        - is_deleted
        - created_at
        - updated_at
      properties:
        id:
          type: integer
          format: int64
          description: Unique identifier for the customer.
          example: 1
        project_id:
          type: string
          description: The project ID associated with the customer.
          example: proj_001
        name:
          type: string
          description: The full name of the customer.
          example: John Doe
        address:
          type: string
          nullable: true
          description: The customer's address.
          example: 123 Main St
        phone:
          type: string
          nullable: true
          description: The customer's phone number.
          example: 555-1234
        aadhar:
          type: string
          nullable: true
          description: The customer's Aadhar number (unique).
          example: '111122223333'
        email:
          type: string
          format: email
          nullable: true
          description: The customer's email address (unique).
          example: john.doe@example.com
        is_deleted:
          type: integer
          enum: [0, 1]
          default: 0
          description: Flag indicating if the customer is soft-deleted (0 = false, 1 = true).
          example: 0
        created_at:
          type: string
          format: date-time
          description: Timestamp when the customer record was created.
          example: '2024-01-01T10:00:00Z'
        updated_at:
          type: string
          format: date-time
          description: Timestamp when the customer record was last updated.
          example: '2024-01-01T10:00:00Z'
    CustomerInput:
      type: object
      required:
        - project_id
        - name
      properties:
        project_id:
          type: string
          description: The project ID associated with the customer.
          example: proj_001
        name:
          type: string
          description: The full name of the customer.
          example: Jane Smith
        address:
          type: string
          nullable: true
          description: The customer's address.
          example: 456 Oak Ave
        phone:
          type: string
          nullable: true
          description: The customer's phone number.
          example: 555-5678
        aadhar:
          type: string
          nullable: true
          description: The customer's Aadhar number (must be unique).
          example: '444455556666'
        email:
          type: string
          format: email
          nullable: true
          description: The customer's email address (must be unique).
          example: jane.smith@example.com
    CustomerUpdateInput:
      type: object
      properties:
        project_id:
          type: string
          description: The project ID associated with the customer.
          example: proj_001
        name:
          type: string
          description: The full name of the customer.
          example: Jane Smith
        address:
          type: string
          nullable: true
          description: The customer's address.
          example: 456 Oak Ave
        phone:
          type: string
          nullable: true
          description: The customer's phone number.
          example: 555-5678
        aadhar:
          type: string
          nullable: true
          description: The customer's Aadhar number (must be unique).
          example: '444455556666'
        email:
          type: string
          format: email
          nullable: true
          description: The customer's email address (must be unique).
          example: jane.smith@example.com
      minProperties: 1 # At least one property must be present for an update
    PaginatedCustomerList:
      type: object
      required:
        - data
        - count
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Customer'
        count:
          type: integer
          example: 50
    ErrorResponse:
      type: object
      required:
        - error
      properties:
        error:
          type: string
          description: A human-readable error message.
          example: Invalid customer ID
`;
