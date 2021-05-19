const Modal = {
  open () {
    // Abrir modal
    // Adicionar a class active ao modal
    document
      .querySelector('.modal-overlay')
      .classList
      .add('active')

    
  },  
  close () {
    // Fechar Modal
    // Remover a class active ao modal
    document
      .querySelector('.modal-overlay')
      .classList
      .remove('active')
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transaction")) || []
  },
  set (transaction) {
    localStorage.setItem("dev.finances:transaction", JSON.stringify(transaction))
  }
}

const Transaction = {
  all: Storage.get(),
  
  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },

  remove (index) {
    // Splice(o elemento, e a quantidade)
    Transaction.all.splice(index, 1)

    App.reload()
  },

  incomes () {
    let income = 0
    // Somar as entradas
    // Pegar todas as transações
    //Para cada transação se ela for maior que zero
    Transaction.all.forEach(transaction => {
      // Se for maior que zero
      if(transaction.amount > 0) {
        // Somar a uma variavel e retornar a variavel
        income += transaction.amount
      }
    })

    return income
  },

  expenses () {
    // Somar todas as saídas
    let expense = 0
    // Pegar todas as transações
    //Para cada transação se ela for maior que zero
    Transaction.all.forEach(transaction => {
      // Se for menor que zero
      if(transaction.amount < 0) {
        // Somar a uma variavel e retornar a variavel
        expense += transaction.amount
      }
    })

    return expense
  },

  total () {
    // Entradas - Saídas = total
    return Transaction.incomes() + Transaction.expenses()
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction (transaction, index) {
    //Criando o tr
    const tr = document.createElement('tr')
    // Adicionando o HTML no tr
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    //Colocando o tr(filho) no tbody(pai) 
    DOM.transactionsContainer.appendChild(tr)
  },

  innerHTMLTransaction (transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense"

    const amount = Utils.formatCurrency(transaction.amount)

    // Aqui é um modelo de html
    const html = `
    <td class="description">${transaction.description}</td>
    <td class="${CSSclass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td>
      <img onclick="Transaction.remove(${index})" src="/src/assets/minus.svg" alt="Remover Transação">
    </td>
    `
    return html
  },

  updateBalance () {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions () {
    DOM.transactionsContainer.innerHTML = ""
  }
}

const Utils = {
  formatAmount (value) {
    value = Number(value) * 100
    // value = Number(value.replace(/\,\./g, "")) * 100
    
    return value
  },

  formatCurrency (value) {
    //Aqui guarda o sinal
    const signal = Number(value) < 0 ? "-" : ""

    //Aqui é uma espressão regular
    //Remover tudo que não for numero
    value = String(value).replace(/\D/g, "")

    //Formatando os numeros e dividindo por 100
    value = Number(value) / 100;

    // Transformando em moedas
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value
  },

  formatDate (date) {
    //Split = Divide um string em array
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),
  
  getValues () {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateField () {
    const { description, amount, date } = Form.getValues()

    //Trim = limpezar dos espaços vazios na string
    if( description.trim() === "" || 
        amount.trim() === "" ||
        date.trim() === "" ) {
          throw new Error("Por favor, preencha todos os campos")
    }
  },

  formatValues () {
    let { description, amount, date } = Form.getValues()
    
    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  clearFields () {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()

    try {
      // Verificar se todas as informações foram preenchidas
      Form.validateField()

      // Formatar os dados para salvar
      const transaction = Form.formatValues()

      // Salvar
      Transaction.add(transaction)

      // Apagar os dados do formulario
      Form.clearFields()

      // Fechar o modal
      Modal.close()

    } catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  init() {
    // Transaction.all.forEach((transaction, index) => {
    //   DOM.addTransaction(transaction, index)
    // })
    Transaction.all.forEach(DOM.addTransaction)
    DOM.updateBalance()
    Storage.set(Transaction.all)
  },

  reload () {
    DOM.clearTransactions()
    App.init()
  },
}

App.init()
