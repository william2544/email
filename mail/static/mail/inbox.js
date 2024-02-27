document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  // The fetch function
  document.querySelector('#compose-form').addEventListener('submit',()=>{
    let recipients=document.querySelector('#compose-recipients').value
    let subject = document.querySelector('#compose-subject').value
    let body = document.querySelector('#compose-body').value
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
  })
  

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#each-email-view').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  //  application of fetch function
  fetch(`/emails/${mailbox}`)
  .then(response=>response.json())
  .then(mail=>{
    // The code that displays each mail.
    mail.forEach(singmail=>{
      console.log(singmail)
      let output=document.createElement('div')
      output.className='card'
      output.style.position='relative'
      output.style.bottom='5px'
      if (mailbox == "inbox"){
        output.innerHTML=`
        <button type="button" class="btn btn-outline-light archive" style='position:absolute; right:0; top:5px;'>archive</button>
        <h3 class="card-header" id="email-recipient"><strong>From</strong>: ${singmail.sender}</h3>
        <h5 class='card-title'>Subject: ${singmail.subject}</h5>
        <p class="card-text">date: ${singmail.timestamp}</p>
        `
      }
      else if(mailbox == "sent"){
        output.innerHTML=`
        <h3 class="card-header" id="email-recipient"><strong>To</strong>: ${singmail.recipients}</h3>
        <h5 class='card-title'>Subject: ${singmail.subject}</h5>
        <p class="card-text">date: ${singmail.timestamp}</p>
        `
      }
      else if(mailbox == 'archive'){
        output.innerHTML=`
        <button type="button" class="btn btn-outline-light unarchive" style='position:absolute; right:0; top:5px;'>unarchive</button>
        <h3 class="card-header" id="email-recipient"><strong>From</strong>: ${singmail.sender}</h3>
        <h5 class='card-title'>Subject: ${singmail.subject}</h5>
        <p class="card-text">date: ${singmail.timestamp}</p>
        `
      }
      else{
        output.innerHTML=`
        <button type="button" class="btn btn-outline-light archive" style='position:absolute; right:0; top:5px;' >archive</button>
        <h3 class="card-header" id="email-recipient"><strong>From</strong>: ${singmail.sender}</h3>
        <h5 class='card-title'>Subject: ${singmail.subject}</h5>
        <p class="card-text">date: ${singmail.timestamp}</p>
        `
      }
      
      // initialize/mark the singmail as unread
      singmail.read = singmail.read || false;

      document.querySelector('#emails-view').append(output)
      // Change background colour based on read or unread condition
      if(singmail.read){
        output.style.backgroundColor = 'gray'
      }
      else{
        output.style.backgroundColor='white'
      }


      // add an onclick function to display every content in it.
      output.addEventListener('click',()=>{
        // send an API that the email is read
        fetch(`/emails/${singmail.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true 
          }),
          headers: {
              'Content-Type': 'application/json'
          }
        })
  
        // Show the each-email-view and hide other views
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';
        document.querySelector('#each-email-view').style.display = 'block';
        // Clear the content of each-email-view
        document.querySelector('#each-email-view').innerHTML = '';
        fetch(`/emails/${singmail.id}`)
        .then(response => response.json())
        .then(email => {
          // Print email
          console.log(email);
      
          let eachMail=document.createElement('div')
          document.querySelector('#each-email-view').append(eachMail)
          eachMail.className='card border-primary mb-3'
          eachMail.innerHTML=`
          <div class="card-header">To: ${email.recipients}</div>
          <div class="card-body text-primary">
            <h5 class="card-title">From: ${email.sender}</h5>
            <p class="card-text">Content:${email.body}</p>
          </div>
          <i>Date: ${email.timestamp}</i>
          <button type="button" class="btn btn-outline-info reply" style='position:absolute; right:0; bottom:5px;' >Reply</button>
          `
          // Reply logic
          let reply_btn=document.querySelector(".reply")
            reply_btn.addEventListener('click', () => {
            console.log('The button is clicked')
            // Redirect to the email composition form
            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#compose-view').style.display = 'block';
            document.querySelector('#each-email-view').style.display = 'none';

            // Pre-fill the composition form fields
            document.querySelector('#compose-recipients').value = singmail.sender;
            let subject = singmail.subject.startsWith("Re: ") ? singmail.subject : `Re: ${singmail.subject}`;
            document.querySelector('#compose-subject').value = subject;
            let body = `On ${singmail.timestamp} ${singmail.sender} wrote:\n${singmail.body}`;
            document.querySelector('#compose-body').value = body;
            fetch('/emails', {
              method: 'POST',
              body: JSON.stringify({
                  recipients: recipients,
                  subject: subject,
                  body: body
              })
            })
            .then(response => response.json())
            .then(result => {
                // Print result
                console.log(result);
            });
          });
    

        });

      })


      // adding unarchive function
      let unarchive=output.querySelector('.unarchive')
      if(unarchive){
        unarchive.addEventListener('click',()=>{
        fetch(`/emails/${singmail.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: false
          })
        })
        .then(response => {
          // After successful unarchiving, load the inbox
          load_mailbox('inbox');
        });
      })
      }      


      //  adding an archive function
      
      let archive=output.querySelector('.archive')
      archive.addEventListener('click',()=>{
        fetch(`/emails/${singmail.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
          })
        })
        .then(response => {
          // After successful archiving, load the inbox
          load_mailbox('inbox');
        })
      })

      
    
    })

   
    
  })

}
