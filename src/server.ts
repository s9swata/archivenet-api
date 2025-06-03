import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";

dotenv.config();

const app = express();

const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const allowedOrigins = process.env.ORIGIN?.split(",").map((origin) =>
	origin.trim(),
) || ["http://localhost:3000"];

// Allows req only from ArchiveNET's official origins & enables credentials
const corsOptions: cors.CorsOptions = {
	origin: (
		origin: string | undefined,
		callback: (error: Error | null, allow?: boolean) => void,
	) => {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
};

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(helmet());

app.get("/", (req, res) => {
	res.send("This is the Backend API for ArchiveNET");
});

app.get("/health", (_req, res) => {
	res.send("API is up and running!");
});

app
	.listen(PORT, () => {
		console.log(`server is running on port ${PORT}`);
	})
	.on("error", (error) => {
		throw new Error(error.message);
	});
