const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer & Order Management API',
      version: '1.0.0',
      description: 'API for managing customers and orders with RabbitMQ integration',
      contact: {
        name: 'API Support',
        email: 'adityamistri19@gmail.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: '/api',
        description: 'API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        Rule: {
          type: 'object',
          properties: {
            field: { type: 'string' },
            operator: { 
              type: 'string', 
              enum: [">", "<", ">=", "<=", "==", "!="],
              description: 'Comparison operator'
            },
            value: { 
              type: 'string',
              description: 'Value to compare against'
            }
          },
          required: ['field', 'operator', 'value']
        },
        RuleGroup: {
          type: 'object',
          properties: {
            operator: { 
              type: 'string', 
              enum: ["AND", "OR"],
              description: 'Logical operator to combine rules'
            },
            rules: {
              type: 'array',
              items: { 
                $ref: '#/components/schemas/Rule' 
              },
              description: 'Array of rules'
            }
          },
          required: ['operator', 'rules']
        },
        Customer: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            status: { 
              type: 'string', 
              enum: ['new', 'active', 'inactive'],
              default: 'new'
            },
            assignedAdmin: { 
              type: 'string',
              description: 'ID of the admin user this customer is assigned to'
            }
          },
          required: ['name', 'email']
        },
        OrderItem: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            quantity: { type: 'number', minimum: 1 },
            price: { type: 'number', minimum: 0 }
          },
          required: ['name', 'quantity', 'price']
        },
        Order: {
          type: 'object',
          properties: {
            user: { 
              type: 'string',
              description: 'ID of the customer who placed the order'
            },
            orderNumber: { type: 'string' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderItem' }
            },
            totalAmount: { type: 'number', minimum: 0 },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              default: 'pending'
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'failed', 'refunded'],
              default: 'pending'
            },
            shippingAddress: { type: 'object' },
            deliveryDate: { type: 'string', format: 'date-time' },
            notes: { type: 'string', maxLength: 1000 }
          },
          required: ['user', 'items', 'totalAmount']
        },
        Campaign: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            segments: {
              type: 'array',
              items: { $ref: '#/components/schemas/RuleGroup' }
            },
            scheduledAt: { type: 'string', format: 'date-time' },
            audienceSize: { type: 'number' },
            audienceUserIds: {
              type: 'array',
              items: { type: 'string' }
            },
            stats: {
              type: 'object',
              properties: {
                sent: { type: 'number' },
                failed: { type: 'number' },
                audienceSize: { type: 'number' }
              }
            }
          },
          required: ['name', 'segments']
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Unauthorized - Authentication credentials were missing or incorrect',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Unauthorized' }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Resource not found' }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and user management'
      },
      {
        name: 'Customers',
        description: 'Customer management'
      },
      {
        name: 'Orders',
        description: 'Order management'
      },
      {
        name: 'Campaigns',
        description: 'Marketing campaigns management'
      }
    ]
  },
  apis: [
    './routes/authRoute.js',
    './routes/customersRoute.js',
    './routes/orderRoute.js',
    './routes/campaignsRoute.js'
  ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Function to setup swagger routes
const setupSwagger = (app) => {
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Customer & Order Management API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    customfavIcon: '/favicon.ico'
  }));

  // Serve swagger spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Swagger documentation available at /api-docs');
};

module.exports = setupSwagger;
