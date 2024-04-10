import Common from 'ethereumjs-common';
export const CONTRACT_ADDRESS = "0x734b75fa5adced1e665b7369c628a898720d3cd4"; //Testnet Contract Address
// export const CONTRACT_ADDRESS = "0xf9c35bf38c9D068743077be73faC6BD32705Bb86" //Mainnet Contract Address
export const INFURA_URL = "https://data-seed-prebsc-2-s1.binance.org:8545/"; //Testnet INFURA URL
// export const INFURA_URL = "https://bsc-dataseed2.binance.org/";  //Mainnet INFURA URL
// export const INFURA_URL = "https://data-seed-prebsc-1-s1.binance.org:8545/";
export const INFURA_ROPSTEN_URL = "https://ropsten.infura.io/v3/e9325616c1904affb8c75fea132bf6f0";
// mainnet
// export const COMMON = Common.forCustomChain(1, {
//     name: 'bnb',
//     networkId: 56,
//     chainId: 56
//     // chainId: 0x61
// }, 'petersburg');

// testnet
export const COMMON = Common.forCustomChain(1, {
    name: 'bnb',
    networkId: 97,
    chainId: 97
}, 'petersburg');
// export const API_URL = "https://pdmota.elblocal.cisinlive.com";
// export const API_URL = "https://www.tradeblocknet.com:3001";
// export const API_URL = "https://pddlt13001.elb.cisinlive.com";
export const API_URL = "http://localhost:3001";
export const ACCOUNT = "";
export const PRIVATE_KEY = "";
export const ENDPOINT = "https://ceramic-clay.3boxlabs.com"
//live stripe key
// export const Publishable_Key = "pk_live_51L94EuKAD5BqJpvKLCvi4Pa2lhAcRf7FlqSpYdTE9LASKkHVSxcNpkTfF79OJnl209e71Ty2s2dJH4OnvUKlqufW00JEpj6Ttp";
export const Publishable_Key = "pk_test_51K4PwzSIO6cxIMLSw8CgeRAEzlUlNxw3TJLnMyg8obnjKbTs9ZOYb6OXohopjUyLX9tqMaeWWpA4ucCJlGr72CHc00GTwlIRrM";
//test stripe key
export const Secret_Key = "sk_test_51K4PwzSIO6cxIMLS7eKauTVr2CNjLy7s4XkVI6MIJUX3TY91YcAjdYNyNEr42Jo6ovjwANTIuKlfnfRMpS6MuwN600MVVVNaqY";
// live stripe key
// export const Secret_Key = "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";
// export const CLIENT_ID = '412075275486-jhbsv0t92ie49cevar1q359aietvp433.apps.googleusercontent.com';
//export const CLIENT_ID = '707057308597-kghmm432l0ei36eo3060lbjchhu35m5n.apps.googleusercontent.com';
//server client id
// export const CLIENT_ID = '645843610097-f9mpim4aiq75akg02sj08fi56qr19va1.apps.googleusercontent.com';
//local client id
// export const CLIENT_ID = '707057308597-n4upp6dqm3p8upvdnm4p3d6t81jrc1b0.apps.googleusercontent.com';
// local(pddlt) client id
// export const CLIENT_ID = '645843610097-lmabm3t69pvs9sd385a8sflgtvl7u2c9.apps.googleusercontent.com'
// local(3000) client id
export const CLIENT_ID = '645843610097-k0gaoera1t0mcpi90ip2fd8cchk0ku3a.apps.googleusercontent.com';
//3000 web3
// export const WEB3AUTH_CLIENTID = "BAwUxP6RpE4I2IJEpHJ0Zy9VmiwspwSWzVaiZWxnVEHbGUme22DSWM7W2EXitLgPYdotqyowsuMhHLOzo_z2Bhc";
//pddlt web3
// export const WEB3AUTH_CLIENTID = "BEjXZhkxiJO26St0eBuEzM4Mf9Tr7tlAKBdYqIO2JIfL_kC7xKCEGO5Mih9vyt203kpJw3toPIoqMdtKGIwYFrk"
//tradeblocknet server web3id
export const WEB3AUTH_CLIENTID = "BFF-DY1jcUQO1TttGkvJYXWwqnrt5Ev8TLhdDhQngvQt0MRY_17tvuky9fow5Z5asfdfFECz166-Ni18j9-zy_c"
//local(3002) client id
// export const CLIENT_ID = '645843610097-9dte92a1idr2hs9v839i99g30lh4jd77.apps.googleusercontent.com';
// server web3 client id
// export const WEB3AUTH_CLIENTID = "BFF-DY1jcUQO1TttGkvJYXWwqnrt5Ev8TLhdDhQngvQt0MRY_17tvuky9fow5Z5asfdfFECz166-Ni18j9-zy_c"
export const REDIRECT_URL = "https://www.tradeblocknet.com/dashboard/myfiles";
// export const REDIRECT_URL = "http://localhost:3000/dashboard/myfiles";
// export const REDIRECT_URL = "http://localhost:3000/";
// export const REDIRECT_URL = "https://pddlt.elb.cisinlive.com/dashboard/myfiles";
export const API_KEY = 'AIzaSyBgmQ-VTtZq0Jvh78Z2NbTpDzbnu9SqdNg';
export const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/people/v1/rest"];
export const SCOPES = "https://www.googleapis.com/auth/contacts.readonly";
export const PINATA_API_KEY = "f81618cf827e4c201d99";
export const PINATA_SECRET_KEY = "929f6f545aaf216a6ba5ae96b92cbad260cb383824cbe15aa96a0611a76652a3";
export const PINATA_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
export const UPLOAD_WARNING = `you are not a user,admin or organization. If you want to upload a
file, so please create Profile for single user or create Company Profile for anorganisation then 
you can upload files`;
export const PARTNER_WARNING = `you are not a user,admin or organization. If you want to upload a
file, so please create Profile for single user or create Company Profile for anorganisation then 
you can upload files`;
export const TRANSFER_WARNING = `you are not a user,admin or organization. If you want to upload a
file, so please create Profile for single user or create Company Profile for anorganisation then 
you can upload files`;
// export const LINKEDIN_CLIENT_SECRET = "t2C8K1rgmtsXnslk";
//local pddlt
export const LINKEDIN_CLIENT_SECRET = "DNvyjmQ9y2XXDnHx";
// export const LINKEDIN_CLIENT_ID = "78z2gmte5rapl5";
//local pddlt
export const LINKEDIN_CLIENT_ID = "78o2i4utpld383";
//pddlt
// export const FB_ID = "352174810057496";
//tradeblocknet server
export const FB_ID = "5068301099956440";
export const ROLES_ARRAY = {
    Role: "User",
    Upload: false,
    Share: false,
    Partner: false,
    Transfer: false,
    Download: false,
    Revokefile: false,
    Inactive: false
};
export const CONTRACT_ABI =
    [
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
                    "name": "_token",
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
                },
                {
                    "internalType": "string",
                    "name": "_roleHash",
                    "type": "string"
                }
            ],
            "name": "addInvitedUsers",
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
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "fileId",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "from",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "to",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "filename",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "time",
                    "type": "uint256"
                }
            ],
            "name": "ShareFile",
            "type": "event"
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
        },
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
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "fileId",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "filename",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "time",
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
                    "name": "_email",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_roleHash",
                    "type": "string"
                }
            ],
            "name": "updateUserPermissions",
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
                    "name": "_token",
                    "type": "string"
                }
            ],
            "name": "getOrganizationUserHash",
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
                },
                {
                    "internalType": "string",
                    "name": "roleHash",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]