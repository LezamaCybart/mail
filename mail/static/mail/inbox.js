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
      for (const mail of emails) { 
        emailDiv = document.createElement('div');
        emailDiv.style.border = 'medium solid #e9ede8';
        emailDiv.style.marginTop = '5px';
        if (mail.read === true) {
          emailDiv.style.color = 'grey';
        }

        senderAndBody = document.createElement('p');
        senderAndBody.innerHTML = `<b>${mail.sender}</b> || ${mail.body}`
        timeStamp = document.createElement('p');
        timeStamp.innerHTML = `${mail.timestamp}`;
        senderAndBody.style.cssFloat = 'left'
        timeStamp.style.cssFloat = 'right'
        senderAndBody.style.marginBot = '6px';
        emailDiv.style.overflow = 'hidden';

        senderAndBody.style.marginLeft = '5px'
        emailDiv.append(senderAndBody);
        emailDiv.append(timeStamp);
        //emailDiv.innerHTML = `${mail.sender} || ${mail.body} || ${mail.timestamp}`

        emailView.append(emailDiv);
      }

    });
}