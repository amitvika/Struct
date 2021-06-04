const fields = [
    { title: "ID", field: "id", editable: "never", align: 'center' },
    { title: "Name", field: "name", type: 'text' },
    { title: "Description", field: "description", type: 'text' },
    { title: "Team", field: "teamId", type: 'select' },
]


const data = [
    {
        "id": "60a93d8af28bab4ac4e9b3d0",
        "name": "u",
        "teamName": "",
        "teamId": "",
        "is_archived": false
    },
    {
        "id": "60a70ad140dea330406cafd3",
        "name": "new task",
        "teamName": "",
        "teamId": "",
        "is_archived": false
    },
    {
        "id": "60a0d5fd34e24b3f6c60e34b",
        "name": "titiklgjlfbklklbjf",
        "teamName": "",
        "teamId": "6062b17b8e3c643af0019ff1",
        "description": "v",
        "is_archived": false
    },
    {
        "id": "60974fd81cb2d361d46f5ebe",
        "name": "lohaddff",
        "teamName": "",
        "teamId": "6062b17b8e3c643af0019ff1",
        "description": "rr",
        "is_archived": false
    },
    {
        "id": "609d5343f46c753168002aee",
        "name": "ean",
        "teamName": "",
        "teamId": "",
        "description": "vf",
        "is_archived": false
    },
    {
        "id": "60674be6292d2b74a8c68d78",
        "name": "gkfnjkgnfk",
        "teamName": "ean",
        "teamId": "6062b17b8e3c643af0019ff1",
        "description": "World12",
        "is_archived": false
    },
    {
        "id": "609754cc1cb2d361d46f5ec0",
        "teamName": "",
        "teamId": "",
        "is_archived": false
    }
]

const searchText = "ean";

    for(let i=0;i<data.length;i++){

        if(data[i] === searchText) {
            console.log("-----",searchText)
        }
}