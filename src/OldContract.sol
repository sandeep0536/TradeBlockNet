export const CONTRACT_ADDRESS = "0xb82d37949fed02576ff9314c4859abeeed6485bb";
export const CONTRACT_ABI =
    [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "fileId",
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
                    "name": "_uploadedBy",
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
                    "name": "_from",
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
                    "name": "fileId",
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
                    "name": "hash",
                    "type": "string"
                },
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
                },
                {
                    "internalType": "string",
                    "name": "userName",
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
                    "name": "filehash",
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
                    "name": "fileId",
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
                    "name": "comment",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "extension",
                    "type": "string"
                }
            ],
            "name": "shareFile",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]