if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const path = require('path');
const storage = require('azure-storage');
const fs=require('fs')
const blobService = storage.createBlobService();

const listContainers = async () => {
    return new Promise((resolve, reject) => {
        blobService.listContainersSegmented(null, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `${data.entries.length} containers`, containers: data.entries });
            }
        });
    });
};

const createContainer = async (containerName) => {
    return new Promise((resolve, reject) => {
        blobService.createContainerIfNotExists(containerName, { publicAccessLevel: 'blob' }, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Container '${containerName}' created` });
            }
        });
    });
};


const uploadLocalFile = async (containerName, filePath) => {
    return new Promise((resolve, reject) => {
        const fullPath = path.resolve(filePath);
        const blobName = path.basename(filePath);
        blobService.createBlockBlobFromLocalFile(containerName, blobName, fullPath, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Local file "${filePath}" is uploaded` });
            }
        });
    });
};
const listBlobs = async (containerName) => {
    return new Promise((resolve, reject) => {
        blobService.listBlobsSegmented(containerName, null, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `${data.entries.length} blobs in '${containerName}'`, blobs: data.entries });
            }
        });
    });
};

const downloadBlob = async (containerName, blobName,localFileName) => {
    return new Promise((resolve,reject)=>{
        blobService.getBlobToLocalFile(containerName, blobName, localFileName, (err,data)=>{
           if(err){
                console.log('here !')
                reject(err);
            }else{
         resolve(data)
         }
        })


    })



};

const execute = async () => {

    const containerName = "babita-1";
    const blobName = "quickstart.txt";
    const content = "hello Blob SDK";
    const localFilePath = "./README.md";
    const localFileName='myFile' ;
    let response;

    console.log("Containers:");
    response = await listContainers();
    response.containers.forEach((container) => console.log(` -  ${container.name}`));

    const containerDoesNotExist = response.containers.findIndex((container) => container.name === containerName) === -1;

    if (containerDoesNotExist) {
        await createContainer(containerName);
        console.log(`Container "${containerName}" is created`);
    }

    // await uploadString(containerName, blobName, content);
    // console.log(`Blob "${blobName}" is uploaded`);

    // response = await uploadLocalFile(containerName, localFilePath);
    // console.log(response.message);

    console.log(`Blobs in "${containerName}" container:`);
    response = await listBlobs(containerName);
    response.blobs.forEach((blob) => console.log(` - ${blob.name}`));

    response = await downloadBlob(containerName, 'README.md' ,localFileName);
    console.log(`Downloaded blob content: ${response.text}"`);

    // await deleteBlob(containerName, blobName);
    // console.log(`Blob "${blobName}" is deleted`);

    // await deleteContainer(containerName);
    // console.log(`Container "${containerName}" is deleted`);

}

execute().then(() => console.log("Done")).catch((e) => console.log(e));
