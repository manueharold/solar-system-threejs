const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const inputDir = "./3d_models"; // Path to your uncompressed models
const outputDir = "./3d_models_compressed"; // Path for the compressed models

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Function to compress a model using gltf-pipeline
function compressModel(file) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file.replace(".glb", "_draco.glb"));

    const command = `gltf-pipeline -i "${inputPath}" -o "${outputPath}" --draco.compressMeshes`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error compressing ${file}:`, error);
            return;
        }
        console.log(`✅ Compressed: ${file} -> ${outputPath}`);
    });
}

// Get all GLB files and compress them
fs.readdir(inputDir, (err, files) => {
    if (err) {
        console.error("❌ Error reading input directory:", err);
        return;
    }

    const glbFiles = files.filter(file => file.endsWith(".glb"));

    if (glbFiles.length === 0) {
        console.log("⚠️ No GLB files found in", inputDir);
        return;
    }

    console.log(`🔄 Compressing ${glbFiles.length} models...`);
    glbFiles.forEach(compressModel);
});
