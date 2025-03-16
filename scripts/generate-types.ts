// scripts/generate-types.ts
import { exec } from 'child_process';
import { writeFile, mkdir } from 'fs/promises';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import swagger2openapi from 'swagger2openapi';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base directories
const TYPES_DIR = join(__dirname, '../src/lib/api/');
const TEMP_DIR = join(__dirname, '../temp');

// API Configuration interface
interface ApiConfig {
	name: string;
	url: string;
	version: string;
	outputPath: string;
}

// API configurations from environment variables
const API_CONFIGS = [
	{
		envVar: 'VITE_API_BASE_URL',
		name: 'portus',
		version: 'v1',
		outputFile: 'portus.v1.d.ts'
	}
];

// Ensure directories exist
async function ensureDirectoriesExist() {
	await mkdir(TYPES_DIR, { recursive: true });
	await mkdir(TEMP_DIR, { recursive: true });
}

// Load API configurations from environment variables
function getApiConfigs(): ApiConfig[] {
	return API_CONFIGS.filter((config) => import.meta.env[config.envVar]).map((config) => ({
		name: config.name,
		url: process.env[config.envVar]!,
		version: config.version,
		outputPath: join(TYPES_DIR, config.outputFile)
	}));
}

async function convertSwaggerToOpenAPI(swagger) {
	try {
		const options = { patch: true, warnOnly: true };
		const { openapi } = await swagger2openapi.convert(swagger, options);
		return openapi;
	} catch (error) {
		console.error('Error converting Swagger to OpenAPI:', error);
		throw error;
	}
}

async function generateTypesForApi(config: ApiConfig) {
	const tempPath = join(TEMP_DIR, `${config.name}-openapi.json`);

	try {
		console.log(`Fetching Swagger schema for ${config.name} from ${config.url}...`);
		const response = await fetch(config.url + '/swagger/doc.json');

		if (!response.ok) {
			throw new Error(`Failed to fetch Swagger schema: ${response.statusText}`);
		}

		const swaggerSchema = await response.json();

		console.log(`Converting Swagger 2.0 to OpenAPI 3.0 for ${config.name}...`);
		const openApiSchema = await convertSwaggerToOpenAPI(swaggerSchema);

		console.log(`Writing OpenAPI schema file for ${config.name}...`);
		await writeFile(tempPath, JSON.stringify(openApiSchema, null, 2));

		console.log(`Generating TypeScript types for ${config.name}...`);
		const { stdout, stderr } = await execAsync(
			`npx openapi-typescript ${tempPath}  --enum --enum-values --output ${config.outputPath}`
		);

		if (stdout) console.log(stdout);
		if (stderr) console.error(stderr);

		console.log(`Types for ${config.name} generated successfully!`);
		return true;
	} catch (error) {
		console.error(`Error generating types for ${config.name}:`, error);
		return false;
	}
}

// Generate index file for easier imports
async function generateIndexFile(configs: ApiConfig[]) {
	const indexContent = configs
		.map((config) => `export * as ${config.name}Api from './${config.name}.${config.version}';`)
		.join('\n');

	await writeFile(join(TYPES_DIR, 'index.ts'), indexContent);
	console.log('Generated index file for easy importing');
}

async function generateAllTypes() {
	try {
		await ensureDirectoriesExist();

		const apiConfigs = getApiConfigs();

		if (apiConfigs.length === 0) {
			console.error('No API configurations found. Please check your environment variables.');
			process.exit(1);
		}

		console.log(`Found ${apiConfigs.length} API configurations to process.`);

		const results = await Promise.all(apiConfigs.map(generateTypesForApi));
		await generateIndexFile(apiConfigs);

		if (results.every(Boolean)) {
			console.log('All types generated successfully!');
		} else {
			console.error('There were errors generating some types.');
			process.exit(1);
		}
	} catch (error) {
		console.error('Error in type generation process:', error);
		process.exit(1);
	}
}

// Execute the type generation
generateAllTypes();
