document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', (e) => {
    e.preventDefault()
    load_mailbox('sent')
  })

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#email-view').innerHTML = '';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  //getting the form content
  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
      .then(response => response.json())
      .then(result => {
        // Print result
        console.log(result)
        load_mailbox('sent')
      });
  }
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  //Clean and hide email view
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#email-view').innerHTML = '';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  // Get mails
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);

      // ... do something else with emails ...
      emailView = document.querySelector('#emails-view');

      emails.forEach(mail => {

        emailLink = document.createElement('a');
        emailLink.id = `${mail.id}`
        emailLink.classList.add("email-link")
        emailLink.href = 'javascript:;'
        emailLink.onclick = () => {
          viewEmail(mail.id, mailbox);
        }

        emailDiv = document.createElement('div');
        emailDiv.classList.add("email-div");

        if (mail.read === true) {
          emailDiv.style.color = 'grey';
        }
        senderAndBody = document.createElement('p');
        senderAndBody.innerHTML = `<b>${mail.sender}</b> || ${mail.body}`
        senderAndBody.classList.add("sender-and-body");

        timeStamp = document.createElement('p');
        timeStamp.innerHTML = `${mail.timestamp}`;
        timeStamp.classList.add("timestamp");

        emailDiv.append(senderAndBody);
        emailDiv.append(timeStamp);
        emailLink.append(emailDiv);
        emailView.append(emailLink);
      });
    });
}

const viewEmail = (mailID, mailbox) => {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';



  fetch(`/emails/${mailID}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);

      // ... do something else with email ...
      viewEmailDiv = document.querySelector('#email-view');

      text = document.createElement('p');
      text.innerHTML = `<b>${email.sender}</b> <p>${email.subject}</p> <p>${email.body}</p> <p>${email.timestamp}</p>`

      //Create archive button if mailbox == inbox
      if (mailbox == 'inbox' || mailbox == 'archive') {
        archiveButton = document.createElement('button');
        if (email.archived == true) {
          archiveButton.textContent = 'Unarchive';
        } else {
          archiveButton.textContent = 'Archive';
        }

        archiveButton.onclick = () => {
          archiveMail(mailID, email.archived);
        }
        viewEmailDiv.append(archiveButton);
      }

      viewEmailDiv.append(text);

    });


  //mark as read
  fetch(`/emails/${mailID}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

const archiveMail = (mailID, archived) => {
  if (archived == true) {
    fetch(`/emails/${mailID}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
    .then(response => response.JSON())
    .then(result => {
      load_mailbox('inbox');
    })
  } else {
    fetch(`/emails/${mailID}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
    .then(response => response.JSON())
    .then(result => {
      load_mailbox('inbox');
    })
  }
}