const typeDefs = `
  enum ProductCategory {
    SHIRT
    PANTS
    HOODIE
    DRESS
    JACKET
  }

  enum ProductSize {
    XS
    S
    M
    L
    XL
  }

  type ProductVariant {
    id: ID!
    size: ProductSize!
    color: String!
    price: Float!
    stock: Int!
  }

  type Product {
    id: ID!
    name: String!
    description: String
    category: ProductCategory!
    images: [String!]!
    variants: [ProductVariant!]!
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedProducts {
    data: [Product!]!
    totalItems: Int!
    totalPages: Int!
    currentPage: Int!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input PaginationInput {
    page: Int!
    limit: Int!
  }

  input ProductFilterInput {
    category: ProductCategory
    minPrice: Float
    maxPrice: Float
    search: String
  }

  input ProductVariantInput {
    size: ProductSize!
    color: String!
    price: Float!
    stock: Int!
  }

  input CreateProductInput {
    name: String!
    description: String
    category: ProductCategory!
    images: [String!]
    variants: [ProductVariantInput!]!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    name: String!
  }

  input ChangePasswordInput {
    oldPassword: String!
    newPassword: String!
  }

  type Query {
    getMe: User!
    getProducts(
      pagination: PaginationInput
      filter: ProductFilterInput
    ): PaginatedProducts!
    getProductById(id: ID!): Product
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): User!
    changePassword(input: ChangePasswordInput!): String!
    createProduct(input: CreateProductInput!): Product!
  }

  type CartItem {
    productId: ID!
    variantId: ID!
    quantity: Int!
  }

  type Cart {
    id: ID!
    userId: ID!
    items: [CartItem!]!
    createdAt: String!
    updatedAt: String!
  }

  input AddToCartInput {
    productId: ID!
    variantId: ID!
    quantity: Int!
  }

  input UpdateCartItemInput {
    productId: ID!
    variantId: ID!
    quantity: Int!
  }

  extend type Query {
    getMyCart: Cart!
  }

  extend type Mutation {
    addToCart(input: AddToCartInput!): Cart!
    updateCartItemQuantity(input: UpdateCartItemInput!): Cart!
    removeFromCart(
      productId: ID!
      variantId: ID!
    ): Cart!
  }

  type OrderItem {
    productId: ID!
    variantId: ID!
    productName: String!
    size: String!
    color: String!
    quantity: Int!
    priceAtPurchase: Float!
  }

  type Order {
    id: ID!
    userId: ID!
    items: [OrderItem!]!
    totalAmount: Float!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedOrders {
    data: [Order!]!
    totalItems: Int!
    totalPages: Int!
    currentPage: Int!
  }

  input CheckoutInput {
    shippingAddress: String!
    phone: String!
  }

  extend type Query {
    getMyOrders(pagination: PaginationInput): PaginatedOrders!
  }

  extend type Mutation {
    checkout(input: CheckoutInput!): Order!
    mockPayOrder(orderId: ID!): Order!
  }
`;

export default typeDefs;
