pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

contract FileMetadata {

struct data {
    string fileName;
    string fileExt;
    address uploadedBy;
    string uploadTime;
    string hash;
    string key;
}

struct keys {
    address _address;
    string _publicKey;
    string _privateKey;
    string _walletpassword;
}

struct Files{
    address reciever;
    string filehash;
    string password;
    string date;
    string time;
    address sender;
    string comment;
    string extension;
}
struct fileOwner{
    string filehash;
    address reciever;
    string date;
    string time;
    address owner;
}

//mapping for filemetadata
mapping(string => data)  fileMetaData;
mapping(address => string[])  userAllFiles;

//mapping for user keys
mapping(address => keys)  userKeys;
mapping(address => address[])  allUsersKeys;

//mapping fore share and retrieve files
mapping(string => Files) file;
mapping(address => string[]) allFilesSharedByOwner;
mapping(address => string[]) allFilesForUser;



    //function to add file metadata
    function addFileMetaData(string memory _fileName,string memory _fileExt,address _uploadedBy,string memory _uploadTime,string memory _hash,string memory _key) public {
        fileMetaData[_hash] = data({
            fileName : _fileName,
            fileExt : _fileExt,
            uploadedBy : _uploadedBy,
            uploadTime :_uploadTime,
            hash : _hash,
            key : _key
        });
        
        userAllFiles[_uploadedBy].push(_hash);
    }

    //function to get file metadata by file hash
    function getFileMetaData(string memory _fileHash) public view returns (
            string memory fileName,
            string memory fileExt,
            address uploadedBy,
            string memory uploadTime,
            string memory hash,
            string memory key
        ){
        return(
            fileMetaData[_fileHash].fileName,
            fileMetaData[_fileHash].fileExt,
            fileMetaData[_fileHash].uploadedBy,
            fileMetaData[_fileHash].uploadTime,
            fileMetaData[_fileHash].hash,
            fileMetaData[_fileHash].key
        );
    }
    
    //function to get file metadata by address
    function getAllFilesUploadedByUser(address _uploadedBy) public view returns (
            string[] memory
        ){
        return(
             userAllFiles[_uploadedBy]
        );
    }
    
    //function for store user keys
    function storeUserKeys(address _address,string memory _publicKey,string memory _privateKey,string memory _password) public {
         userKeys[_address]=keys({
            _address : _address,
            _walletpassword: _password,
            _publicKey : _publicKey,
            _privateKey : _privateKey
        });
        
        allUsersKeys[_address].push(_address);
    }

    //function for check if keys already generated of address
    function isKeyAlreadyGenerated(address _address)public view returns(bool){
        if(userKeys[_address]._address==_address){
            return true;
        }
    }

    //function for get file password
    function getFilePassword(string memory hash)public view returns(string memory password){
            return fileMetaData[hash].key;
    }
    
    //function for get extension
    function getExtension(string memory hash) public view returns(string memory extension){
        return fileMetaData[hash].fileExt;
    }
    
    //function for share file
    function shareFile(address _address, string memory  _hash,string memory _password,string memory _date,string memory _time,string memory comment,string memory extension)public {
        file[_hash]=Files({
            reciever:_address,
            filehash:_hash,
            password:_password,
            date :_date,
            time :_time,
            sender:msg.sender,
            comment:comment,
            extension:extension
        });
        allFilesSharedByOwner[msg.sender].push(_hash);
        allFilesForUser[_address].push(_hash);
    }
    
    //function to get all shred files by address
    function getAllSharedHash(address _sharedBy) public view returns (
            string[] memory
        ){
        return(
             allFilesSharedByOwner[_sharedBy]
        );
    }
    
    //function to get all files for reciever
    function getFileHashForReciever(address _reciever)public view returns(string[] memory){
        return allFilesForUser[_reciever];
    }
    
    //function to get particular file for reciever
    function getParticularFile(string memory _hash)public view returns(
        string memory password,
        string memory date,
        string memory time){
        return (
            file[_hash].password,
            file[_hash].date,
            file[_hash].time
            );
    }

    //function for getFilesDetails
    function getFileDetails(string memory _hash)public view returns (
            string memory hash,
            address from,
            address to,
            string memory date,
            string memory time,
            string memory comment
        ){
        return(
            file[_hash].filehash,
            file[_hash].sender,
            file[_hash].reciever,
            file[_hash].date,
            file[_hash].time,
            file[_hash].comment
        );
        
        
    }
}