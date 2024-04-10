exports.ADDRESS = "0x81dc712ac7f036cf12c432bdc203a57942b128e8";
exports.URL = "https://data-seed-prebsc-2-s3.binance.org:8545/";
// exports.URL = "https://data-seed-prebsc-1-s1.binance.org:8545/"
exports.ABI =
    [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "To",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "transferTime",
                    "type": "uint256"
                }
            ],
            "name": "TransferOwnership",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_fileId",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_fileName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_fileExt",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "_owner",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "_uploadTime",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_project",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_fileSize",
                    "type": "string"
                }
            ],
            "name": "addFileMetaData",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_email",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_did",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                }
            ],
            "name": "addUser",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_uploadedBy",
                    "type": "address"
                }
            ],
            "name": "getAllFilesUploadedByUser",
            "outputs": [
                {
                    "internalType": "string[]",
                    "name": "",
                    "type": "string[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_sharedBy",
                    "type": "address"
                }
            ],
            "name": "getAllSharedHash",
            "outputs": [
                {
                    "internalType": "string[]",
                    "name": "",
                    "type": "string[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_fileId",
                    "type": "string"
                }
            ],
            "name": "getAllTracibilityLogs",
            "outputs": [
                {
                    "internalType": "string[]",
                    "name": "",
                    "type": "string[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "hash",
                    "type": "string"
                }
            ],
            "name": "getExtension",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "extension",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                }
            ],
            "name": "getFileDetails",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "from",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "to",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "date",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "shareTime",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "ext",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "fileName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "comment",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_reciever",
                    "type": "address"
                }
            ],
            "name": "getFileHashForReciever",
            "outputs": [
                {
                    "internalType": "string[]",
                    "name": "",
                    "type": "string[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                }
            ],
            "name": "getFileIdByShareHash",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "fileId",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                }
            ],
            "name": "getFileIdByUploadHash",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "fileId",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_fileHash",
                    "type": "string"
                }
            ],
            "name": "getFileMetaData",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "fileName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "fileExt",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "uploadedBy",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "uploadTime",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "hash",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "project",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                }
            ],
            "name": "getFileSize",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "size",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                }
            ],
            "name": "getFileStatus",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "status",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                }
            ],
            "name": "getParticularFile",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "password",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "date",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "extension",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "fileName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "senderName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "comment",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "time",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_email",
                    "type": "string"
                }
            ],
            "name": "getUserData",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "hash",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "userDID",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_date",
                    "type": "string"
                }
            ],
            "name": "revokeFile",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_did",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_email",
                    "type": "string"
                }
            ],
            "name": "setDID",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_fileId",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "_address",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_password",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_date",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_time",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_recieverName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_senderName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_fileName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_comment",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_extension",
                    "type": "string"
                }
            ],
            "name": "shareFile",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_oldhash",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_newhash",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "_address",
                    "type": "address"
                }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]