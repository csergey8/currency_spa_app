window.addEventListener('load', ()=> {
  const el = $('#app');


  // Compile Handlebar Templates
  const errorTemplate = Handlebars.compile($('#error-template').html());
  const ratesTemplate = Handlebars.compile($('#rates-template').html());
  const exchangeTemplate = Handlebars.compile($('#exchange-template').html());
  const historicalTemplate = Handlebars.compile($('#historical-template').html());

 
  //Router declaration
  const router = new Router({
    mode: 'history',
    page404: (path) => {
      const html = errorTemplate({
        color: 'yellow',
        title: 'Error 404 - Page NOT Found!',
        massage: `The path ${path} does not exist`
      });
      el.html(html);

    },
  });

  //Instantiate api handler 
  const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 5000
  });

  //Display Error Banner 
  const showError = (error) => {
    const { title, message } = error.response.data;
    const html = errorTemplate({ color: 'red', title, message });
    el.html(html);
  };



  router.add('/', async () => {
    // Display Loader First
   let html = ratesTemplate();
   el.html(html);
   try {
    //Load Currency Rates
    const response = await api.get('/rates');
    const { base, date, rates } = response.data;
    //Display Rates Table 
    html = ratesTemplate({ base, date, rates });
    console.log(base, date, rates);
    el.html(html);
   } catch (error) {
    showError(error);
   } finally {
     //Remove loader status
     $('.loading').removeClass('loading');
   }
  });

  
    //Perform POST request, calculate and display conversion result
    const getConversionResult = async () => {
      //Extract from data
      const from = $('#from').val();
      const to = $('#to').val();
      const amount = $('#amount').val();
      
      //Send POST request data to express
      try {
        const response = await api.post('/convert', { from, to });
        const { rate } = response.data;
        const result = rate * amount;
        $('#result').html(`${to} ${result}`);
      } catch (error) {
        showError(error);
        
      } finally {
        $('#result-segment').removeClass('loading');
      }
    };

    //Handle Convert Button Event Click
    const convertRatesHandler = () => {
      if($('.ui.form').form('is valid')) {
        //hide error message 
        $('.ui.error.message').hide();
        //post to express server
        $('#result-segment').addClass('loading');
        getConversionResult();
        //Prevent page from submitting to server
        return false;
      }
      return true;
    };

    router.add('/exchange', async () => {
      //Display loader first
      let html = exchangeTemplate();
      el.html(html);
      try {
        //Load Symbols
        const response = await api.get('/symbols');
        const { symbols } = response.data;
        html = exchangeTemplate({ symbols });
        el.html(html);
        $('.loading').removeClass('loading');
        //Validate form inputs
        $('.ui.form').form({
          fields: {
            from: 'empty',
            to: 'empty',
            amount: 'decimal'
          }
        });
        //Specify Submit Handler 
        $('.submit').click(convertRatesHandler);
      } catch (error) {
        showError(error);
      }
  });

  

  //Perform POST request to get historical rates
  const getHistoricalRates = async () => {
    const date = $('#date').val();
    try {
    
      const response = await api.post('/historical', { date });
      const { base, rates } = response.data;
      const html = ratesTemplate({ base, rates, date });
      console.log(html);
      $('#historical-table').html(html);
    } catch(error) {
      showError(error)
    } finally {
      $('.segment').removeClass('loading');
    }
  };
  //Handler for Historical Rates
  const historicalRatesHandler = () => {
    if($('.ui.form').form('is valid')) {
      //hide error message
      $('.ui.error.message').hide();
      //Indicate loading status
      $('.segment').addClass('loading');
      getHistoricalRates();
      //Prevent page to submitting to server
      return false
    }
    return true;
  };

  router.add('/historical', () => {
    //Display form
    const html = historicalTemplate();
    el.html(html);
    // Activate Date Picker
    $('#calendar').calendar({
      type: 'date',
      formatter: {
        date: date => new Date(date).toISOString().split('T')[0]
      }
    });
    //Validate Date Input
    $('.ui.form').form({
      fields: {
        date: 'empty'
      },
    });
    $('.submit').click(historicalRatesHandler);
  });



  //Navigate app to current url
  router.navigateTo(window.location.pathname);

  // Higlight Active Menu on Refresh/Page Reload
  const link = $(`a[href$='${window.location.pathname}']`);
  link.addClass('active');

  $('a').on('click', (e) => {
    e.preventDefault();

    //Highlight active menu on click
    const target = $(e.target);
    $('.item').removeClass('active');
    target.addClass('active');


    //Navigate to cliked url
    const href = target.attr('href');
    const path = href.substr(href.lastIndexOf('/'));
    router.navigateTo(path);
  });






});