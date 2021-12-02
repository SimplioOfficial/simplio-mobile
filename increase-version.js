const fs = require('fs-extra');
const readline = require('readline');

const iosProject = 'ios/App/App.xcodeproj/project.pbxproj';
const androidProject = 'android/app/build.gradle';

const versions = [];
let versionCode = 0;

async function getIosVersions() {
  const fileStream = fs.createReadStream(iosProject);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    if (line.indexOf('CURRENT_PROJECT_VERSION') > -1) {
      versions.push(line.split('=')[1].trim().slice(0, -1));
    }
  }
}
async function getAndroidVersions() {
  const fileStream = fs.createReadStream(androidProject);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    if (line.indexOf('versionName') > -1) {
      versions.push(line.split('versionName')[1].trim().slice(1, -1));
    }

    if (line.indexOf('versionCode') > -1) {
      versionCode = +line.split('versionCode')[1].trim();
    }
  }
}

getAndroidVersions().then(() =>
  getIosVersions().then(() => {
    console.log(versions, versionCode);
    if (versions[0] === versions[1] && versions[2] === versions[0]) {
      const newPackage = +versions[0].split('.')[3] + 1;
      const updatedPackage = `${versions[0].split('.')[0]}.${versions[0].split('.')[1]}.${
        versions[0].split('.')[2]
      }.${newPackage}`;
      const newCode = versionCode + 1;
      console.log('New version', updatedPackage);
      console.log('New version code', newCode);

      fs.readFile(iosProject, 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }
        const result = data.replace(versions[0], updatedPackage).replace(versions[0], updatedPackage);
        fs.writeFile(iosProject, result, 'utf8', function (err) {
          return console.log(err);
        });
        console.log('DONE', iosProject);
      });

      fs.readFile(androidProject, 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }
        const result = data
          .replace(versions[0], updatedPackage)
          .replace(`versionCode ${versionCode}`, `versionCode ${newCode}`);
        fs.writeFile(androidProject, result, 'utf8', function (err) {
          return console.log(err);
        });
        console.log('DONE', androidProject);
      });
    } else {
      console.log('INCONSISTENT VERSIONS. UPDATE VERSION MANUALLY !!!');
      console.log('INCONSISTENT VERSIONS. UPDATE VERSION MANUALLY !!!');
      console.log('INCONSISTENT VERSIONS. UPDATE VERSION MANUALLY !!!');
    }
  })
);
