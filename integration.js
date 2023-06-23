//-----------------------------------------------------------------------------------------
//general functions
//-----------------------------------------------------------------------------------------
goHome = () => {
  document.location.href = `accountPage.html?accId=${params.accId}`
}
goHomeAccounts = () => {
  document.location.href = `loggedInDashboard.html`
}
logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('name')
  window.location.href = 'index.html'
}
//-----------------------------------------------------------------------------------------
async function handleLogin() {
  try {
    const email = document.getElementById('emailOrPhone').value
    const password = document.getElementById('password').value
    if (email.trim() === '' || password.trim() === '') {
      return false // Prevent the form submission
    }

    const response = await fetch(
      'https://bankapi-6c8a.onrender.com/api/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    )

    const data = await response.json()
    if (data.status == true) {
      const token = data.token
      localStorage.setItem('token', token)
      document.location.href = 'loggedInDashboard.html'
      return
    } else {
      throw new Error(data.message)
    }
  } catch (err) {
    console.log(err.message)
    const warningBox = document.getElementById('warningBox')
    warningBox.textContent = err.message
    warningBox.style.display = 'block'
    setTimeout(function () {
      //async operation to hide the warning box
      warningBox.style.display = 'none'
    }, 3000)
  }
}
async function handleSignUp() {
  try {
    const firstName = document.getElementById('Firstname').value
    const lastName = document.getElementById('Lastname').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const mobileNumber = document.getElementById('phone').value
    const name = firstName + ' ' + lastName
    const dateOfBirth = document.getElementById('dateOfBirth').value
    if (
      firstName.trim() === '' ||
      lastName.trim() === '' ||
      email.trim() === '' ||
      password.trim() === '' ||
      mobileNumber.trim() === '' ||
      !email.includes('@') ||
      password.length < 8
    ) {
      return false
    }
    const response = await fetch(
      'https://bankapi-6c8a.onrender.com/api/signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          mobileNumber,
          dateOfBirth,
        }),
      }
    )
    const data = await response.json()
    if (data.status == false) {
      throw new Error(data.message)
    }
    //signed up successfully
    const successBox = document.getElementById('successBox')
    successBox.textContent = data.message
    successBox.style.display = 'block'
    setTimeout(function () {
      //async operation to hide the warning box
      successBox.style.display = 'none'
    }, 3000)
    //go to login page
    document.location.href = 'signin.html'
  } catch (err) {
    console.log(err.message)
    const warningBox = document.getElementById('warningBoxSignUp')
    warningBox.textContent = err.message
    warningBox.style.display = 'block'
    setTimeout(function () {
      //async operation to hide the warning box
      warningBox.style.display = 'none'
    }, 3000)
  }
}
//once logged in, show accounts
async function showAccounts() {
  try {
    //fetch all accounts
    //go to loggedInDashboard.html that shows all accounts
    const token = localStorage.getItem('token')

    const response = await fetch(
      'https://bankapi-6c8a.onrender.com/api/getAllAccounts',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )
    const data = await response.json()

    if (data.status == false) {
      throw new Error(data.message)
    }
    //console.log(data) //data has accounts array, each account has id, status, & balance
    // Get the container element
    const container = document.getElementById('accountContainer')
    const dashboardName = document.getElementById('dashboardName')
    dashboardName.textContent = data.userName
    //clear container
    container.innerHTML = ''
    if (data.accounts.length == 0) {
      const div = document.createElement('div')
      div.className = 'noAccount'
      div.textContent = 'No Accounts Found'
      container.appendChild(div)
      return
    }
    // Else.. Loop through all accounts
    data.accounts.forEach((account) => {
      // Create a div for each account
      const div = document.createElement('div')
      div.className = 'account'
      div.id = account.accId
      // Create a h3 and add the account name to it
      const h3 = document.createElement('h3')
      h3.className = 'heading-tertiary'
      h3.textContent = account.status + ' Status'
      // Create a p and add the account balance to it
      const p = document.createElement('p')
      p.textContent = '$' + account.balance

      const button = document.createElement('button')
      button.className = 'btn btn--green'
      button.textContent = 'Navigate'
      // Append the h3, p, and btn to the div
      div.appendChild(h3)
      div.appendChild(p)
      div.appendChild(button)
      // Append the div to the container
      container.appendChild(div)
      button.onclick = function () {
        window.location.href = `accountPage.html?accId=${div.id}`
      }
    })
  } catch (err) {
    console.log(err.message)
    const warningBox =
      //document.getElementById('warningBox') ||
      document.getElementById('warningBoxTwo')
    warningBox.textContent = err.message
    warningBox.style.display = 'block'
    setTimeout(function () {
      //async operation to hide the warning box
      warningBox.style.display = 'none'
    }, 3000)
  }
}
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
})

async function navigateToAccount() {
  //fetch account information
  try {
    const accId = params.accId
    const token = localStorage.getItem('token')
    const response = await fetch(
      'https://bankapi-6c8a.onrender.com/api/getAccountDetails/' + accId,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )
    const data = await response.json()
    if (data.status == false) {
      throw new Error(data.message)
    }
    if (data.userStatus == 'main') {
      //show buttons
      const buttons = document.getElementById('accountPageButtons')
      buttons.style.display = 'flex'
      const famButton = document.getElementById('accountPageFam')
      famButton.style.display = 'block'
    }
    const accountName = document.getElementById('accountPageName')
    accountName.textContent = data.userName
    const accountBalance = document.getElementById('accountPageBalance')
    accountBalance.textContent = '$' + data.userBalance
    const ccNumber = document.getElementById('accountPageccNumber')
    //space between each 4 digits in cc number
    const ccNumberString = data.account.creditCard.number.toString()
    const ccNumberSpaced = ccNumberString.replace(/(.{4})/g, '$1 ')
    ccNumber.textContent = ccNumberSpaced
    const ccName = document.getElementById('accountPageccName')
    ccName.textContent = data.userName
    const ccExp = document.getElementById('accountPageccExp')
    ccExp.textContent = data.account.creditCard.expiryDate
    const ccCvv = document.getElementById('accountPagecccvv')
    ccCvv.textContent = data.account.creditCard.cvv
    //transactions
    const transactions = document.getElementById('transactionul')
    const transactionsArray = data.account.transactions
    for (
      let i = transactionsArray.length - 1;
      i >= 0 && i >= transactionsArray.length - 3;
      i--
    ) {
      const li = document.createElement('li')
      //to do.. for convenience, add add user name in transactions array in addition to the id, the following approach works but inefficient
      //--------------------------------------
      // const response2 = await fetch(
      //   'https://bankapi-6c8a.onrender.com/api/getNameFromID/' +
      //     accId +
      //     '/' +
      //     transactionsArray[i].userId,
      //   {
      //     method: 'GET',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // )
      // const data2 = await response2.json()
      // if (data2.status == false) {
      //   throw new Error(data2.message)
      // }
      // transactionsArray[i].userId = data2.name
      //---------------------------------------
      li.textContent = ` ${transactionsArray[i].desc} - ${transactionsArray[i].type} - $${transactionsArray[i].amount} - by user ${transactionsArray[i].userId}`
      transactions.appendChild(li)
    }
  } catch (err) {
    console.log(err.message)
    const warningBox = document.getElementById('warningBoxThree')
    warningBox.textContent = err.message
    warningBox.style.display = 'block'
    setTimeout(function () {
      //async operation to hide the warning box
      warningBox.style.display = 'none'
    }, 3000)
  }
}
async function showAllTransactions() {
  try {
    const accId = params.accId
    const token = localStorage.getItem('token')
    const response = await fetch(
      'https://bankapi-6c8a.onrender.com/api/getAccountDetails/' + accId,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )
    const data = await response.json()
    if (data.status == false) {
      throw new Error(data.message)
    }
    const accountName = document.getElementById('accountPageName')
    accountName.textContent = params.name
    const transactions = document.getElementById('transactionul')
    transactions.innerHTML = ''

    const transactionsArray = data.account.transactions
    for (let i = transactionsArray.length - 1; i >= 0; i--) {
      const li = document.createElement('li')
      //to do.. for convenience, add user name in transactions array in addition to the id, the following approach works but inefficient
      //--------------------------------------
      // const response2 = await fetch(
      //   'https://bankapi-6c8a.onrender.com/api/getNameFromID/' +
      //     accId +
      //     '/' +
      //     transactionsArray[i].userId,
      //   {
      //     method: 'GET',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // )
      // const data2 = await response2.json()
      // if (data2.status == false) {
      //   throw new Error(data2.message)
      // }
      // transactionsArray[i].userId = data2.name
      //---------------------------------------
      li.textContent = ` ${transactionsArray[i].desc} - ${transactionsArray[i].type} - $${transactionsArray[i].amount} - by user ${transactionsArray[i].userId}`
      transactions.appendChild(li)
    }
  } catch (err) {
    console.log(err.message)
    const warningBox = document.getElementById('warningBoxFour')
    warningBox.textContent = err.message
    warningBox.style.display = 'block'
    setTimeout(function () {
      //async operation to hide the warning box
      warningBox.style.display = 'none'
    }, 3000)
  }
}
async function payBill(billType) {
  try {
    const amount = document.getElementById(`${billType}Amount`).value
    if (amount.trim() == '') {
      throw new Error('Please enter an amount')
    }
    const automaticMonthlyPayment = document
      .getElementById(`${billType}AutomaticPayment`)
      .checked.toString()
    if (billType == 'others') {
      const billNumber = document.getElementById('othersBillNumber').value
      billType = document.getElementById('othersBillType').value
      if (billNumber.trim() == '') {
        throw new Error('Please enter a bill number')
      }
      if (billType.trim() == '') {
        throw new Error('Please enter a bill type')
      }
      billType = billType + ' , Bill Number : ' + billNumber
    }
    const data = await fetch(
      'https://bankapi-6c8a.onrender.com/api/billPayment/' +
        billType +
        '/' +
        params.accId,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: amount,
          monthlyRepeat: automaticMonthlyPayment,
        }),
      }
    )
    const response = await data.json()
    if (response.status == false) {
      throw new Error(response.message)
    }
    let successBox = document.getElementById('successBoxBill')
    if (billType == 'others') {
      successBox = document.getElementById('successBoxBillOthers')
    }
    successBox.textContent = response.message
    successBox.style.display = 'block'
    setTimeout(function () {
      //async operation to hide the warning box
      successBox.style.display = 'none'
    }, 3000)
  } catch (err) {
    console.log(err.message)
    let warningBox = document.getElementById('warningBoxFive')
    if (billType == 'others') {
      warningBox = document.getElementById('warningBoxSix')
    }
    warningBox.textContent = err.message
    warningBox.style.display = 'block'
    setTimeout(function () {
      //async operation to hide the warning box
      warningBox.style.display = 'none'
    }, 3000)
  }
}
async function setAllowance() {
  try {
    const transferToEmail = document.getElementById('transferToEmail').value
    if (transferToEmail.trim() == '' || !transferToEmail.includes('@')) {
      throw new Error('Please enter a valid email address')
    }
    const amount = document.getElementById('allowanceAmount').value
    if (amount.trim() == '' || amount < 0 || isNaN(amount)) {
      throw new Error('Please enter a valid amount')
    }
    const instantTransfer = document
      .getElementById('instantTransfer')
      .checked.toString()
    const data = await fetch(
      'https://bankapi-6c8a.onrender.com/api/allowance/' + params.accId,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ amount, transferToEmail, instantTransfer }),
      }
    )
    const response = await data.json()
    if (response.status == false) {
      throw new Error(response.message)
    }
    let successBox = document.getElementById('successBoxAllowance')
    successBox.textContent = response.message
    successBox.style.display = 'block'
    setTimeout(function () {
      successBox.style.display = 'none'
    }, 3000)
  } catch (err) {
    console.log(err.message)
    let warningBox = document.getElementById('warningBoxSeven')
    warningBox.textContent = err.message
    warningBox.style.display = 'block'
    setTimeout(function () {
      warningBox.style.display = 'none'
    }, 3000)
  }
}
async function addDebits() {
  try {
    const title = document.getElementById('debitsTitle').value
    if (title.trim() == '') {
      throw new Error('Please enter a title')
    }
    const amount = document.getElementById('debitsAmount').value
    if (amount.trim() == '' || amount < 0 || isNaN(amount)) {
      throw new Error('Please enter a valid amount')
    }
    const date = document.getElementById('endDate').value
    const today = new Date()
    const endDate = new Date(date)
    if (date.trim() == '' || endDate < today) {
      throw new Error('Please enter a valid date')
    }

    const dayString = date.split('-')[2]
    const monthString = date.split('-')[1]
    const yearString = date.split('-')[0]
    const data = await fetch(
      'https://bankapi-6c8a.onrender.com/api/addDebit/' + params.accId,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title,
          amount,
          day: dayString,
          month: monthString,
          year: yearString,
        }),
      }
    )
    const response = await data.json()
    if (response.status == false) {
      throw new Error(response.message)
    }
    let successBox = document.getElementById('successBoxDebits')
    successBox.textContent = response.message
    successBox.style.display = 'block'
    setTimeout(function () {
      successBox.style.display = 'none'
    }, 3000)
  } catch (err) {
    console.log(err.message)
    let warningBox = document.getElementById('warningBoxEight')
    warningBox.textContent = err.message
    warningBox.style.display = 'block'
    setTimeout(function () {
      warningBox.style.display = 'none'
    }, 3000)
  }
}
async function addAccount() {
  try {
    const amount = document.getElementById('newAccAmount').value
    if (amount.trim() == '' || amount < 0 || isNaN(amount)) {
      throw new Error('Please enter a valid amount')
    }
    const confirmed = document.getElementById('confirm').checked.toString()
    if (confirmed == 'false') {
      throw new Error(
        'Please confirm the creation of the account before proceeding'
      )
    }
    const data = await fetch(
      'https://bankapi-6c8a.onrender.com/api/createAccount',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ balance: amount }),
      }
    )
    const response = await data.json()
    if (response.status == 'false') {
      throw new Error(response.message)
    }
    let successBox = document.getElementById('successBoxNew')
    successBox.textContent = response.message
    successBox.style.display = 'block'
    setTimeout(function () {
      successBox.style.display = 'none'
    }, 3000)
  } catch (err) {
    console.log(err.message)
    const warningBox = document.getElementById('warningBoxNine')
    warningBox.textContent = err.message
    warningBox.style.display = 'block'
    setTimeout(function () {
      warningBox.style.display = 'none'
    }, 3000)
  }
}
async function addFamilyMember() {
  try {
    const accId = params.accId
    const email = document.getElementById('newUserEmail').value
    if (email.trim() == '' || !email.includes('@')) {
      throw new Error('Please enter a valid email address')
    }
    const newBalance = document.getElementById('newBalance').value
    if (newBalance.trim() == '' || newBalance < 0 || isNaN(newBalance)) {
      throw new Error('Please enter a valid amount')
    }
    const mainStatus = document.getElementById('mainStatus').checked
    let status = 'main'
    if (mainStatus == false) {
      status = 'sub'
    }
    const data = await fetch(
      'https://bankapi-6c8a.onrender.com/api/addUser/' + accId,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          email: email,
          newStatus: status,
          newBalance: newBalance,
        }),
      }
    )
    const response = await data.json()
    if (response.status == false) {
      throw new Error(response.message)
    }
    let successBox = document.getElementById('successBoxFamMember')
    successBox.textContent = response.message
    successBox.style.display = 'block'
    setTimeout(function () {
      successBox.style.display = 'none'
    }, 3000)
  } catch (err) {
    console.log(err.message)
    const warningBox = document.getElementById('warningBoxTen')
    warningBox.textContent = err.message
    warningBox.style.display = 'block'
    setTimeout(function () {
      warningBox.style.display = 'none'
    }, 3000)
  }
}
