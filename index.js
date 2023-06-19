const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

// Read the JSON configuration file
const config = require("./databases.json");

// Perform the backup for each database
async function performBackups() {
  try {
    const timestamp = moment().format("HHmmss-DDMMYYYY");
    const backupsDir = path.join(__dirname, "backups");

    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir);
    }

    for (const dbConfig of config.databases) {
      const { user, password, database, host, port } = dbConfig;

      const backupPath = path.join(
        backupsDir,
        `${host}-${database}-${timestamp}.sql`
      );

      try {
        await createBackup(user, password, host, port, database, backupPath);
        console.log(`Backup created for ${database}.`);
      } catch (error) {
        console.error(`Error creating backup for ${database}:`, error);
      }
    }
  } catch (error) {
    console.error("Error creating backups:", error);
  }
}

// Create a database backup
async function createBackup(user, password, host, port, database, backupPath) {
  return new Promise((resolve, reject) => {
    // Construct the pg_dump command with the password
    const command = `PGPASSWORD=${password} pg_dump -U ${user} -h ${host} -p ${port} -Fc -f ${backupPath} ${database}`;

    // Execute the pg_dump command
    const childProcess = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error creating backup for ${database}:`, stderr);
        reject(error);
      } else {
        resolve();
      }
    });

    // Print any command output
    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);
  });
}

// Call the function to perform backups
performBackups();
