document.addEventListener('DOMContentLoaded', () => {
  const notePreviewList = document.querySelector(".note_previews")
  const noteCard = document.querySelector(".noteCard")
  const nameSpan = document.querySelector(".username")
  const newNoteform = document.querySelector(".add-note-form")
  const submitButton = document.querySelector('.submitBtn')
  const updateButton = document.querySelector(".update")
  const folderSelector = document.querySelector(".folders")
  const folderList = document.querySelector(".folder_list")
  const sideBar = document.querySelector(".sidebar")
  const createFolderForm = document.querySelector(".newFolderForm")
  const folderSpan = document.querySelector('.folder_span')
  const folderContents = document.querySelector('.folder_notes')
  const body = document.getElementById("bg-change")
  createFolderForm.style.display = 'none'
  newNoteform.style.display = 'none'
  let newNote = false
  let newFolder = false
  let bodyClassBody = false


  noteCard.addEventListener('click', editOrDelete)
  notePreviewList.addEventListener("click", fetchNote)
  nameSpan.addEventListener('click', showSubmitButton)
  newNoteform.addEventListener('click', submitNote)
  sideBar.addEventListener('click', displayFolderForm)
  createFolderForm.addEventListener('click', fetchPostFolder)
  folderList.addEventListener('click', displayFolderContents)

  function capitalize(string) {
   return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // begin screen

  fetchNotesFromUser()


  function fetchNotesFromUser(){
    fetch('http://localhost:3000/api/v1/users/1')
    .then(resp => resp.json())
    .then(user => {loadHeader(user)
                  fetchFolders(user)
                  iterateThroughFolders(user, displayFoldersOnSideBar)})
  }


  function displayFoldersOnSideBar(folder){
    folderList.innerHTML += `<a><li style="list-style-type: none;" class= "folder" data-id= ${folder.id} > ${capitalize(folder.name)}</li></a>`
  }


  function loadHeader(user) {
    nameSpan.dataset.id = user.id
    nameSpan.innerHTML = `<h1>${user.name}<h1>
                          <button class= "addBtn" data-id="" > New Note</button>`
  }


    function displayFolderContents(e){
      if (e.target.className === "folder"){
        hideForm()
        const newNoteButton = document.querySelector('.addBtn')
        const folderId = e.target.dataset.id
        folderSpan.innerText = e.target.innerText
        newNoteButton.dataset.id = folderId
        noteCard.innerHTML =""
        notePreviewList.innerHTML =""
        fetchFolderContents(folderId)
      }
    }


    function fetchFolderContents (folderId){
    fetch(`http://localhost:3000/api/v1/folders/${folderId} `).then(resp => resp.json())
    .then(iterateThroughFoldersNotes)
  }
//displaying notes

  function iterateThroughFoldersNotes(folder){
    const folderDeleteButton = document.querySelector('.deleteFolder')
    const notes = folder.notes
    if (notes.length === 0){
      notePreviewList.innerHTML = `<h2> The folder "${folder.name}" is empty. Add some notes! </h2>`
      }
    notes.forEach(displayNotePreview)
    folderDeleteButton.innerHTML = `<button class= "deleteFolderButton" data-id= ${folder.id}> Delete Folder</button>`
    folderDeleteButton.addEventListener('click', deleteFolder)
  }

  function displayNotePreview(note){
    let noteId = note.id
    let noteBody = note.body
    let notePreview = Array.from(noteBody).slice(0,30).join("")+"..."
    notePreviewList.innerHTML += `<li style="list-style-type: none;" class= "note" data-id= ${noteId} > ${capitalize(note.title)} ⤏ ${notePreview}</li><br>`
  }

  function hideForm(){
    newNoteform.style.display = 'none'
    body.className = ""
    newNote =false
    bodyClassBody = false
  }

// Making note previews clickable

  function fetchNote(e) {
    if (e.target.className === "note") {
    let noteId = e.target.dataset.id
    fetch(`http://localhost:3000/api/v1/notes/${noteId}`)
      .then(resp => resp.json())
        .then(displayNoteCard)
      }
  }

  function displayNoteCard(note) {
      hideForm()
      noteCard.dataset.id = note.id
      noteCard.innerHTML = `<div class =        "notebody"> <h1> ${note.title} </h1>
                          <h2> <p>${note.body} <p> </h2>
                          <button class= "edit" data-id= ${note.id}> Edit </button>
                          <button class= "delete" data-id= ${note.id}> Delete <img src="http://cdn.osxdaily.com/wp-content/uploads/2010/07/512-TrashIcon-macosx1.png" width="10" height="10"> </button> </div>`

  }

  //Choosing Between Editing or Deleting Note

  function editOrDelete(e){
    if (e.target.className === "delete"){
      updateView(e)
    }
    else if (e.target.className === "edit") {
      setUpEditForm(e)
    }
  }

  //Making Note Cards Deletable

  function updateView(e){
    let noteId = e.target.dataset.id
    document.querySelector(`li[data-id = '${noteId}']`).remove()
    noteCard.innerHTML = ""
      fetchDeleteNote(noteId)
  }

  function fetchDeleteNote(noteId){
    fetch(`http://localhost:3000/api/v1/notes/${noteId}`, {
      method: 'DELETE'
    })
  }

  // Editing notes

  function setUpEditForm(e) {
    const noteId = e.target.dataset.id
    const newNoteButton = document.querySelector('.addBtn')
    folderSpan.innerHTML = ""
    submitButton.style.display = 'none'
    updateButton.style.display = 'block'
    newNoteform.style.display = 'block'
    body.className = "body"
    notePreviewList.innerHTML =""
    updateButton.dataset.id = noteId
    newNoteform.elements[0].value = e.target.previousElementSibling.previousElementSibling.innerText
    newNoteform.elements[1].value = e.target.previousElementSibling.innerText
    newNoteform.elements[2].value = newNoteButton.dataset.id
    noteCard.innerHTML =""
    updateButton.addEventListener('click', fetchPatchEdit)
    newNote = false
    bodyClassBody = false

  }

  function fetchPatchEdit(e){
    const title = e.target.parentElement.elements[0].value
    const body = e.target.parentElement.elements[1].value
    const noteId = e.target.dataset.id
    fetch(`http://localhost:3000/api/v1/notes/${noteId}`, {
      method: "PATCH",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        title: title,
        body: body,
        folder_id: folderSelector.value
      })
    }).then(resp => resp.json()).then(note => {
        updatePage(note)
    })

  }


  // Creating New Note
  function showSubmitButton(e){
    updateButton.style.display = 'none'
    submitButton.style.display = 'block'
    displayNewForm(e)
  }

  function displayNewForm(e){
    const newNoteButton = document.querySelector('.addBtn')
    noteCard.innerHTML = ""
    notePreviewList.innerHTML = ""
    newNoteform.elements[0].value = ""
    newNoteform.elements[1].value = ""
    newNoteform.elements[2].value = newNoteButton.dataset.id
    if (e.target.className === "addBtn") {
        newNote = !newNote
        bodyClassBody = !bodyClassBody
        if (newNote) {
          newNoteform.style.display = 'block'
          body.className = "body"

          } else {
          newNoteform.style.display = 'none'
          body.className = ""
        }
    }

  }

  function submitNote(e) {
    const userId = e.target.parentNode.parentNode.previousElementSibling.dataset.id
    e.preventDefault()
    if (e.target.className === "submitBtn") {
      fetchPost(e)
    }
  }

  function fetchPost(e){
    const title = newNoteform.elements[0].value
    const body = newNoteform.elements[1].value
    const userId = parseInt(e.target.parentNode.parentNode.previousElementSibling.dataset.id)
    fetch('http://localhost:3000/api/v1/notes', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        title: `${title}`,
        body: `${body}`,
        user_id: userId,
        folder_id: folderSelector.value

      })
    }).then(resp=> resp.json())
        .then(updatePage)
  }

  function updatePage(note){
    const folderId = note.folder.id
    hideForm()
    fetchFolderContents(folderId)
    displayNoteCard(note)
  }


// Adding all of the Users' folders to the selector


  function fetchFolders(user){
    const userId = user.id
    fetch(`http://localhost:3000/api/v1/users/${userId}`)
    .then(resp => resp.json())
      .then(user => iterateThroughFolders(user, displayFolder))
  }

  function iterateThroughFolders(user, iteratorFunction) {
    user.folders.forEach(iteratorFunction)
  }

  function displayFolder(folder) {
    console.log("FOLDER", folder)
    let option = document.createElement('option')
    option.value = folder.id
    option.innerText = capitalize(folder.name)
    folderSelector.append(option)
}

//Create Folder

  function displayFolderForm(e){
    const errorMessage = document.querySelector('.error_message')
    const createFolderButton = document.querySelector(".createFolderButton")
    errorMessage.innerHTML =""
    createFolderForm.elements[0].value = ""
    if (e.target.className === "createFolderButton"){
    newFolder = !newFolder
      if (newFolder) {
        createFolderForm.style.display = 'block'
        createFolderButton.innerHTML = "Back"
      } else {
        createFolderForm.style.display = 'none'
        createFolderButton.innerHTML = "Create Folder"
            }
    }
  }

  function fetchPostFolder(e){
    e.preventDefault()
    let userId = e.target.parentElement.parentElement.nextElementSibling.firstElementChild.dataset.id
    let newFolderName = createFolderForm.elements[0].value
    if (e.target.className === "submitFolderButton"){
    fetch('http://localhost:3000/api/v1/folders', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: newFolderName,
        user_id: userId
      })
    }).then(showError)
  }
}

  function showError(response){
    let json = response.json()
    console.log(json)
    const errorMessage = document.querySelector('.error_message')
    if (response.status === 403){
      errorMessage.innerHTML = `There's already a folder with this name.`
    }
    else{
      errorMessage.innerHTML = ""
      updateFolderList()
    }
  }

  function updateFolderList(){
    folderList.innerHTML = ''
    fetchNotesFromUser()
  }


  // Deleting Folder
  function deleteFolder(e){
    if (e.target.className === 'deleteFolderButton') {
      fetchDeleteFolder(e)
    }
  }

  function fetchDeleteFolder(e){
    const folderId = e.target.dataset.id
    fetch(`http://localhost:3000/api/v1/folders/${folderId}`, {
      method: 'DELETE'
    }
  ).then(updateFolderContentView(folderId))
    .then(updateFolderList)
  }

  function updateFolderContentView (folderId) {
      folderSpan.innerHTML = ""
      notePreviewList.innerHTML = ""
      let deleteFolderButton = document.querySelector('.deleteFolderButton')
      if (deleteFolderButton.dataset.id === folderId) {
        deleteFolderButton.style.display = 'none'
      }
  }

})
