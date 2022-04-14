'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
    owner: 'John Smith',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2021-11-18T21:31:17.178Z',
        '2021-12-23T07:42:02.383Z',
        '2021-01-28T09:15:04.904Z',
        '2021-04-01T10:17:24.185Z',
        '2021-05-08T14:11:59.604Z',
        '2021-05-27T17:01:17.194Z',
        '2021-07-11T23:36:17.929Z',
        '2021-07-12T10:51:36.790Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2021-11-01T13:15:33.035Z',
        '2021-11-30T09:48:16.867Z',
        '2021-12-25T06:04:23.907Z',
        '2021-01-25T14:18:46.235Z',
        '2021-02-05T16:33:06.386Z',
        '2021-04-10T14:43:26.374Z',
        '2021-06-25T18:49:59.371Z',
        '2021-07-26T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const formatMovements = function (date, locale) {
    const calcDaysPassed = (date1, date2) => Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)))

    const daysPassed = calcDaysPassed(new Date(), date)
    if (daysPassed === 0) return 'Today'
    if (daysPassed === 1) return 'Yesterday'
    if (daysPassed <= 7) return `${daysPassed} days ago`
    else {
        return new Intl.DateTimeFormat(locale).format(date)
    }
}

const formatCur = function (value, locale, currency) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
    }).format(value)
}

const displayMovements = function (account, sort = false) {
    containerMovements.innerHTML = ''
    const movs = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements

    movs.forEach(function (mov, i) {
        const type = mov > 0 ? 'deposit' : 'withdrawal'
        const date = new Date(account.movementsDates[i])
        const displayDate = formatMovements(date, account.locale)
        const formattedMov = formatCur(+mov, account.locale, account.currency)

        const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
        </div>
        `;
        containerMovements.insertAdjacentHTML('afterbegin', html)
    })
}

const calcDisplayBalance = function (account) {
    account.balance = account.movements.reduce((acc, cur) => acc + cur, 0)
    labelBalance.textContent = formatCur(account.balance, account.locale, account.currency)
}

const calcDisplaySummary = function (account) {
    const incomes = account.movements.filter(mov => mov > 0)
        .reduce((acc, mov) => acc + mov, 0)
    labelSumIn.textContent = formatCur(incomes, account.locale, account.currency)

    const out = account.movements.filter(mov => mov < 0)
        .reduce((acc, mov) => acc + mov, 0)
    labelSumOut.textContent = formatCur(Math.abs(out), account.locale, account.currency)

    const interest = account.movements.filter(mov => mov > 0)
        .map(deposit => deposit * account.interestRate / 100)
        .filter(int => int >= 1)
        .reduce((acc, int) => acc + int, 0)
    labelSumInterest.textContent = formatCur(interest, account.locale, account.currency)
}

const createUserNames = function (accounts) {
    accounts.forEach(acc => acc.username = acc.owner
        .toLowerCase()
        .split(' ')
        .map(name => name[0])
        .join(''))
}
createUserNames(accounts)

const updateUi = function (account) {
    // Display Movements
    displayMovements(account)

    // Display Balance
    calcDisplayBalance(account)

    // Display Summary
    calcDisplaySummary(account)
}

const startLogOutTimer = function () {
    let time = 600
    const tick = function () {
        const min = String(Math.trunc(time / 60)).padStart(2, '0')
        const sec = String(time % 60).padStart(2, '0')
        labelTimer.textContent = `${min}:${sec}`

        if (time === 0) {
            clearInterval(timer)
            containerApp.style.opacity = '0'
            labelWelcome.textContent = 'Log in to get started'
        }

        time--
    }
    tick()
    const timer = setInterval(tick, 1000)
    return timer
}

//Event handlers
let currentAccount, timer;

btnLogin.addEventListener('click', function (event) {
    event.preventDefault()
    currentAccount = accounts.find(
        acc => acc.username === inputLoginUsername.value
    )

    const now = new Date()
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    }

    if (currentAccount?.pin &&
        currentAccount.pin === +inputLoginPin.value &&
        currentAccount.username === inputLoginUsername.value) {
        // Display UI and message
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}!`
        containerApp.style.opacity = 1

        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now)

        // Clearing input fields
        inputLoginPin.value = inputLoginUsername.value = ''
        inputLoginUsername.blur()
        inputLoginPin.blur()

        // Timer
        if (timer) clearInterval(timer)
        timer = startLogOutTimer()

        // Update UI
        updateUi(currentAccount)
    } else {
        labelWelcome.textContent = `Log in to get started`
        containerApp.style.opacity = 0

        // Clearing input fields
        inputLoginPin.value = inputLoginUsername.value = ''
        inputLoginUsername.blur()
        inputLoginPin.blur()
        alert('Username or password is not correct')
    }
})

btnTransfer.addEventListener('click', function (event) {
    event.preventDefault()
    const amount = +inputTransferAmount.value
    const receiverAccount = accounts.find(acc => acc.username === inputTransferTo.value)
    if (amount > 0
        && receiverAccount
        && receiverAccount?.username === inputTransferTo.value
        && amount <= currentAccount.balance
        && receiverAccount.username !== currentAccount.username) {
        // Doing the transfer
        currentAccount.movements.push(-amount)
        receiverAccount.movements.push(amount)

        // Add transfer date
        currentAccount.movementsDates.push(new Date().toISOString())
        receiverAccount.movementsDates.push(new Date().toISOString())

        // Update UI
        updateUi(currentAccount)

        // Reset timer
        clearInterval(timer)
        timer = startLogOutTimer()
    } else {
        alert('Receiver can not receive that amount')
        inputTransferTo.value = inputTransferAmount.value = ''
        inputTransferAmount.blur()
        inputTransferTo.blur()
    }
    inputTransferTo.value = inputTransferAmount.value = ''
    inputTransferAmount.blur()
    inputTransferTo.blur()
})

btnLoan.addEventListener('click', function (event) {
    event.preventDefault()
    const amount = +Math.floor(inputLoanAmount.value)
    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
        alert('Bank gives loan after 2.5s')
        setTimeout(function () {
            currentAccount.movements.push(amount)
            currentAccount.movementsDates.push(new Date().toISOString())
            updateUi(currentAccount)
            clearInterval(timer)
            timer = startLogOutTimer()
        }, 2500)
    } else {
        alert(`You can not get that amount of loan`)
    }

    // Add transfer date

    inputLoanAmount.value = ''
    inputLoanAmount.blur()
})

btnClose.addEventListener('click', function (event) {
    event.preventDefault()
    if (currentAccount.pin === +inputClosePin.value
        && currentAccount.username === inputCloseUsername.value) {
        const index = accounts.findIndex(acc => acc.username === inputCloseUsername.value)
        // Delete account
        accounts.splice(index, 1)

        // Hide UI
        containerApp.style.opacity = 0
        clearInterval(timer)
    } else {
        alert('Username or pin is not correct')
    }
    inputClosePin.value = inputCloseUsername.value = ''
    inputClosePin.blur()
    inputCloseUsername.blur()
})

let sorted = false
btnSort.addEventListener('click', function (event) {
    event.preventDefault()
    displayMovements(currentAccount, !sorted)
    sorted = !sorted
})
