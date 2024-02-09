document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-view').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});



function send_email() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value.replaceAll("\n", "<br>")
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then (response => response.json())
  .then (emails => emails.forEach(element => {

      const email = document.createElement("div");
      const sender = document.createElement("div");
      const time = document.createElement("div");
      const subject = document.createElement("div");

      email.className = 'email';
      sender.className = 'inbox_sender';
      time.className = 'inbox_time';
      subject.className= 'inbox_subject';

      sender.innerHTML = `From: ${element.sender}`;
      time.innerHTML = element.timestamp;
      subject.innerHTML = element.subject;
      console.log(element.read);
      if (element.read == true) {
        email.style.backgroundColor = "#f2f6fc";
        email.style.borderColor = "#cccccc";
      } else {
        email.style.backgroundColor = "#ffffff";
      }
      email.append(sender);
      email.append(time);
      email.append(subject);

      email.addEventListener('click', () => view_email(element))

      document.querySelector("#emails-view").append(email);

    }));
};

function f_reply(email) {
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  if (email.subject.slice(0, 3) == "Re:") {
    document.querySelector('#compose-subject').value = email.subject;
  } else {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }
  document.querySelector('#compose-body').value = `\n---\nOn  ${email.timestamp}, ${email.sender} wrote:\n${email.body.replaceAll("<br>", "\n")}\n`;
};


function view_email(email) {
  document.querySelector("#email-view").innerHTML = "";
  fetch (`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block'; 
  

  const sender = document.createElement("div");
  const time = document.createElement("div");
  const recipients = document.createElement("div");
  const subject = document.createElement("div");
  const body = document.createElement("div");
  const archive = document.createElement("button");
  const reply = document.createElement("button");

  reply.innerHTML = "Reply";

  if (!email.archived) {
    archive.innerHTML = "Archive";
  } else {
    archive.innerHTML = "Unarchive";
  }
  
  archive.className ="btn btn-sm btn-outline-primary";
  reply.className = "btn btn-sm btn-outline-primary";
  archive.addEventListener("click", function () {
    fetch (`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: !email.archived
      })
    })
    .then ((response) => load_mailbox('inbox'));
  })

  reply.addEventListener("click", () => f_reply(email));


  body.innerHTML = email.body;
  subject.innerHTML = email.subject;
  sender.innerHTML = `From: ${email.sender}`;
  time.innerHTML = email.timestamp;
  recipients.innerHTML = `To: ${email.recipients.join(', ')}`;

  time.className = 'inbox_time';
  subject.className = 'email_subject';

  const email_v = document.querySelector("#email-view");
  
  email_v.append(subject);
  email_v.append(document.createElement("hr"));
  email_v.append(sender);
  email_v.append(recipients);
  email_v.append(document.createElement("hr"));
  email_v.append(time);
  email_v.append(body);
  email_v.append(document.createElement("hr"));
  email_v.append(reply);
  email_v.append(archive);
  
  
  
};

