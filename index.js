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

      await createBackup(user, password, host, port, backupPath);
      console.log(`Backup created for ${database}.`);
    }
  } catch (error) {
    console.error("Error creating backups:", error);
  }
}

// Create a database backup
async function createBackup(user, password, host, port, backupPath) {
  try {
    // Construct the pg_dumpall command with the password
    const command = `PGPASSWORD=${password} pg_dumpall -U ${user} -h ${host} -p ${port} -f ${backupPath}`;

    // Execute the pg_dumpall command
    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error("Error creating backup:", stderr);
          reject(error);
        } else {
          resolve();
        }
      });
    });

    console.log("Backup created.");
  } catch (error) {
    console.error("Error creating backup:", error);
  }
}

// Call the function to perform backups
performBackups();
