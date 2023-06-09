const express = require("express");
const paypal = require("paypal-rest-sdk");

//let PORT = 3000

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AUo-kQDHSBws6GPcrblX_2jVzKoQrAI1tUCx9QMWVPh1E4LXDhBQprFeZo1YlrsuxtYZpil-xqn1lwg9",
  client_secret:
    "EOKjzpRyxHdOHY5mGWZEYRi-W6lluLiEPY2I90NLfzBHbvJbX-acExPMlBAXG1va0wg8E1mfpZwoFYmt",
});

const PORT = process.env.PORT || 3000

const app = express();
app.use(express.static(__dirname + '/public'));

const handlebars = require('express-handlebars')
             .create({ defaultLayout:'home' });
 app.engine('handlebars', handlebars.engine); 
 app.set('view engine', 'handlebars');


//app.get("/", (req, res) => res.sendFile(__dirname + "home"));

app.get('/', function(req, res){
  res.render('home');
});

app.get('/completed', function(req, res){
  res.render('completed');
});

app.post("/checkout", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Chicken and Chips with Coke Zero",
              sku: "001",
              price: "7.9",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "7.9",
        },
        description: "Full lunch meal for everyone",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "7.9",
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
       res.send('Payment of $7.9 using Paypal was Successful');
       //return res.redirect('/completed');
        
      }
    }
  );
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(PORT, () => console.log(`Server Started on ${PORT}`));