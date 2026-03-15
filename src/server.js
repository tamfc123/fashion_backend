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
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();
await connectDB();

const app = express();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageLocalDefault()],
});

await server.start();

// REST routes
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);

app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
        context: async ({ req }) => ({
            user: await authMiddleware(req),
            req: req,
        }),
    })
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});