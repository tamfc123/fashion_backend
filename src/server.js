import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { connectDB } from "./config/db.js";
import typeDefs from "./schema/typeDefs.js";
import resolvers from "./schema/resolvers.js";
import authMiddleware from "./middleware/auth.js";

import { graphqlUploadExpress } from "graphql-upload-minimal";

dotenv.config();
await connectDB();

const app = express();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageLocalDefault()],
});

await server.start();

// Use graphql-upload-minimal middleware before Apollo
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 5 }));

app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
        context: async ({ req }) => ({
            user: authMiddleware(req),
        }),
    })
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});