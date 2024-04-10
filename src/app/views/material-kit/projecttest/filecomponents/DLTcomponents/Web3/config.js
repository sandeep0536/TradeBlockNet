export const META_DATA_ADDRESS = "0xfce1a09e1621a02f649613d3b650b9952ad8dce9";
export const ACCOUNT = localStorage.getItem("address");
export const PRIVATE_KEY = localStorage.getItem("privateKey");
export const META_DATA_ABI =
	[
		{
			"inputs": [
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
					"name": "_key",
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
					"internalType": "address",
					"name": "from",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"internalType": "string",
					"name": "date",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "time",
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
					"name": "key",
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
					"name": "hash",
					"type": "string"
				}
			],
			"name": "getFilePassword",
			"outputs": [
				{
					"internalType": "string",
					"name": "password",
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
					"name": "time",
					"type": "string"
				},
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
			"name": "getStatus",
			"outputs": [
				{
					"internalType": "string",
					"name": "status1",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "reason",
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
					"name": "_address",
					"type": "address"
				}
			],
			"name": "isKeyAlreadyGenerated",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
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
					"name": "_status",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "_reason",
					"type": "string"
				}
			],
			"name": "setStatus",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
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
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_address",
					"type": "address"
				},
				{
					"internalType": "string",
					"name": "_publicKey",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "_privateKey",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "_password",
					"type": "string"
				}
			],
			"name": "storeUserKeys",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}
	]
