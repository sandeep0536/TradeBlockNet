// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

contract FileMetadata {
    struct data {
        string fileName;
        string fileExt;
        address uploadedBy;
        string uploadTime;
        string hash;
        string project;
        string from;
        string fileId;
        string fileSize;
    }
    struct Files{
        string fileId;
        address _address;
        string filehash;
        string password;
        string date;
        string time;
        string sender;
        string reciever;
        string fileName;
        string comment;
        string extension;
    }
    struct FileStatus{
        string status;
    }
    struct User{
        string email;
        string userHash;
        string userDID;
    }

    //only owner modifier
    modifier onlyOwner(address _address) {
      require(msg.sender == _address,"Only owner can access this function");
      _;
   }
    
    //mapping for filemetadata
    mapping(string => data)  fileMetaData;
    mapping(address => string[]) userAllFiles;
    mapping(string => address[]) allOwners;
    mapping(string => string[]) fileDID;
    mapping(address => string[]) transferHashes;
    mapping(string => FileStatus) fileStatus;
    mapping(string => User) user;
    //mapping fore share and retrieve files
    mapping(string => Files) file;
    mapping(address => string[]) allFilesSharedByOwner;
    mapping(address => string[]) allFilesForUser;

    //function to add user data
    function addUser(
        string memory _email,
        string memory _did,
        string memory _hash
    ) public {
        User storage userdata = user[_email];
        userdata.email = _email;
        userdata.userDID = _did;
        userdata.userHash = _hash;
    }

    //function to set DID of user
    function setDID(string memory _did, string memory _email) public {
        User storage userdata = user[_email];
        userdata.userDID = _did;
    }

    //function to add file metadata
    function addFileMetaData(
        string memory _fileId,
        string memory _fileName,
        string memory _fileExt,
        address _uploadedBy,
        string memory _uploadTime,
        string memory _hash,
        string memory _project,
        string memory _from,
        string memory _fileSize
        ) public {
        fileMetaData[_hash] = data({
            fileName : _fileName,
            fileExt : _fileExt,
            uploadedBy : _uploadedBy,
            uploadTime :_uploadTime,
            hash : _hash,
            fileId: _fileId,
            from: _from,
            project : _project,
            fileSize:_fileSize
        });
        userAllFiles[_uploadedBy].push(_hash);
        allOwners[_hash].push(_uploadedBy);
        fileDID[_fileId].push(_hash);
        fileStatus[_hash] = FileStatus({
            status:"Upload"
        });
    }

    //function for share file
    function shareFile(
        string memory _fileId,
        address _address,
        string memory _hash,
        string memory _password,
        string memory _date,
        string memory _time,
        string memory _recieverName,
        string memory _senderName,
        string memory _fileName,
        string memory _comment,
        string memory _extension
        )public {
        file[_hash]=Files({
            fileId : _fileId,
            _address : _address,
            filehash : _hash,
            password : _password,
            date : _date,
            time : _time,
            sender : _senderName,
            reciever : _recieverName,
            fileName : _fileName,
            comment : _comment,
            extension : _extension
        });
        allFilesSharedByOwner[msg.sender].push(_hash);
        allFilesForUser[_address].push(_hash);
        fileDID[_fileId].push(_hash);
        fileStatus[_hash] = FileStatus({
            status:"Share"
        });
    }

    //function to revoke file from receiver
    function revokeFile(string memory _hash, string memory _date) public {
        Files storage files = file[_hash];
        files.date = _date;
        fileStatus[_hash] = FileStatus({
            status:"Revoked"
        });
    }
  
    //function to get user data
    function getUserData (
        string memory _email
    ) public view returns (string memory hash,string memory userDID){
        return (
            user[_email].userHash,
            user[_email].userDID
        );
    }

    //function to get file hash by address
    function getAllFilesUploadedByUser(address _uploadedBy) public view returns (
            string[] memory
    ){
        return(
             userAllFiles[_uploadedBy]
        );
    }


    //function to get file metadata by file hash
    function getFileMetaData(string memory _fileHash) public view returns (
            string memory fileName,
            string memory fileExt,
            address uploadedBy,
            string memory uploadTime,
            string memory hash,
            string memory project,
            string memory userName
        ){
        return(
            fileMetaData[_fileHash].fileName,
            fileMetaData[_fileHash].fileExt,
            fileMetaData[_fileHash].uploadedBy,
            fileMetaData[_fileHash].uploadTime,
            fileMetaData[_fileHash].hash,
            fileMetaData[_fileHash].project,
            fileMetaData[_fileHash].from
        );
    }
 
    //function for getFilesDetails
    function getFileDetails(string memory _hash)public view returns (
        string memory from,
        string memory to,
        string memory date,
        string memory shareTime,
        string memory ext,
        string memory fileName,
        string memory comment
    ){
        return(
            file[_hash].sender,
            file[_hash].reciever,
            file[_hash].date,
            file[_hash].time,
            file[_hash].extension,
            file[_hash].fileName,
            file[_hash].comment
        );
    }
    //function to get particular file for reciever
    function getParticularFile(string memory _hash)public view returns(
        string memory password,
        string memory date,
        string memory extension,
        string memory fileName,
        string memory senderName,
        string memory comment,
        string memory time
        ){
        return (
            file[_hash].password,
            file[_hash].date,
            file[_hash].extension,
            file[_hash].fileName,
            file[_hash].sender,
            file[_hash].comment,
            file[_hash].time
            );
    }

    //function to get all shred files by address
    function getAllSharedHash(address _sharedBy) public view returns (
        string[] memory
    ){
        return(
             allFilesSharedByOwner[_sharedBy]
        );
    }
    //get all tracability logs of file
    function getAllTracibilityLogs(string memory _fileId) public view returns (
        string[] memory
    ){
        return(
             fileDID[_fileId]
        );
    }
    //function for get extension
    function getExtension(string memory hash) public view returns(string memory extension){
        return fileMetaData[hash].fileExt;
    }

    //function to get file size
    function getFileSize(string memory _hash) public view returns(string memory size){
        return fileMetaData[_hash].fileSize;
    }

    //function to get all files for reciever
    function getFileHashForReciever(address _reciever)public view returns(string[] memory){
        return allFilesForUser[_reciever];
    }
    //function to get all files for reciever
    function getFileIdByShareHash(string memory _hash)public view returns(string memory fileId){
        return file[_hash].fileId;
    }
    //function to get all files for reciever
    function getFileIdByUploadHash(string memory _hash)public view returns(string memory fileId){
        return fileMetaData[_hash].fileId;
    }
   
   //function to get file status by hash
   function getFileStatus(string memory _hash) public view returns(string memory status){
       return fileStatus[_hash].status;
   }
   
   //function to transfer ownership of file
   function transferOwnership (string memory _hash,address _address) public {
       require(fileMetaData[_hash].uploadedBy == msg.sender,"Only woner can transfer file ownership");
       fileStatus[_hash] = FileStatus({
           status : "Transfer"
       });
       transferHashes[_address].push(_hash);
       allOwners[_hash].push(_address);
   }

   //function to get all transferred files hash
   function getAllTransferredFiles (address _address) public view returns (string[] memory) {
       return transferHashes[_address];
   }

   //function to get all owners of file
   function getOwners(string memory _hash) public view returns (address[] memory){
       return allOwners[_hash];
   }
}