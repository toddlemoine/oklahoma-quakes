  // {
  //   "id": 525271202516852000,
  //   "text": "Magnitude 3.1 at 2014-10-23 02:06:03.088999 (CDT) 5.1 miles SE of Jefferson; 36.680,-97.715,z=3.9km",
  //   "magnitude": "3.1",
  //   "at": "2014-10-23 02:06:03.088999",
  //   "distance": "5.1",
  //   "direction": "SE",
  //   "city": "Jefferson;",
  //   "lat": "36.680",
  //   "long": "-97.715",
  //   "z": "3.9km"
  // }

// function(window, undefined) {
    
    queue()
      .defer(d3.json, "okearthquakes_tweets.json")
      .await(ready);
    
    var _tweets, all, date, dates, hour, hours, city, cities, magnitude, magnitudes, citiesIndex, days, day;
     
    var DAYS_OF_WEEK = "SUN MON TUE WED THU FRI SAT".split(" ");
      
    function ready(error, tweets) {
        var parseDate = d3.time.format('%Y-%m-%d %X').parse;

        tweets = _.reject(tweets, function(d) { 
            return !d.city; 
        });
        
        // Create city index
        citiesIndex = tweets.map(function(d) {
            return d.city ? d.city.toLowerCase() : '';    
        });
        
        citiesIndex = _.uniq(citiesIndex).sort();
        
        // Coerce any values
        tweets.forEach(function(d, index) {
            var timestamp = d.at.substr(0, d.at.lastIndexOf('.'));
            d.date = parseDate(timestamp);
            d.z = +d.z.replace('km', '');
            d.magnitude = +d.magnitude;
            d.cityIndex = citiesIndex.indexOf(d.city.toLowerCase());
        });
        
        _tweets = tweets = _.reject(tweets, function(d) { 
            return !d.date; 
        });
        
        // Create our crossfilters
        tweets = crossfilter(tweets);
        // all = tweets.group();
        
        date = tweets.dimension(function(d) { return d.date; });
        dates = date.group(d3.time.day);
            
        day = tweets.dimension(function(d) { return d.date.getDay(); });
        days = day.group();
            
        hour = tweets.dimension(function(d) { 
                        return d.date.getHours() + d.date.getMinutes() / 60; 
                    });
        hours = hour.group(Math.floor);
        
        city = tweets.dimension(function(d) { return d.cityIndex; });
        cities = city.group();
        
        magnitude = tweets.dimension(function(d) { return d.magnitude; });
        magnitudes = magnitude.group(Math.floor);
        
        function onCheckboxClick() {
            var val = this.value;
            var dim = this.dataset.dim;

            if (this.checked) {
                filters.push({ dim: dim, value: val });
            } else {
                filters = _.reject(filters, function(filter) {
                    return filter.dim === dim && filter.value === val; 
                });   
            }
            
            setFilters();            
            render();
                
        }
        
        function setFilters() {
            day.filterAll();
            city.filterAll();
            filters.forEach(function(filter) {
                if (filter.dim === 'city') city.filter(filter.value);
                if (filter.dim === 'day') day.filter(filter.value);
                if (filter.dim === 'magnitude') magnitude.filter(filter.value);
            });
        }
        
        // Build our controls
        var filters = [];
        
        
        var days = d3.select('#days')
            .selectAll('li')
            .data(DAYS_OF_WEEK)
                .enter()
                .append(function(d, index) {
                    var dayId = 'day'+index;
                    var li = d3.select(document.createElement('li'));
                    li.append('input')
                        .attr('id', dayId)
                        .attr('type', 'checkbox')
                        .attr('value', index)
                        .attr('data-dim', 'day')
                        .on('click', onCheckboxClick);
                    li.append('label')
                        .attr('for', dayId)
                        .text(d);
                    return li.node();
                });
        
        var cities = d3.select('#cities')
            .selectAll('li')
            .data(cities.top(10))
                .enter()
                .append(function(d, index) {
                    var id = 'city'+index;
                    var li = d3.select(document.createElement('li'));
                    li.append('input')
                        .attr('id', id)
                        .attr('type', 'checkbox')
                        .attr('value', d.key)
                        .attr('data-dim', 'city')
                        .on('click', onCheckboxClick);
                    li.append('label')
                        .attr('for', id)
                        .text(citiesIndex[d.key]);
                    return li.node();
                });
        
        var magnitudes = d3.select('#magnitudes')
            .selectAll('li')
            .data(magnitudes.top(10))
                .enter()
                .append(function(d, index) {
                    var id = 'mag'+index;
                    var li = d3.select(document.createElement('li'));
                    li.append('input')
                        .attr('id', id)
                        .attr('type', 'checkbox')
                        .attr('value', d.key)
                        .attr('data-dim', 'magnitude')
                        .on('click', onCheckboxClick);
                    li.append('label')
                        .attr('for', id)
                        .text(d.key);
                    return li.node();
                });
                
        render();
        
        function render() {
            var table = d3.select('#data table');
            
            var data = date.top(10);
            var keys = ['id', 'magnitude', 'at', 'city', 'date'];
            
            var head = d3.select('#data thead')
                .selectAll('tr')
                .data([keys]);
                
            head.exit().remove();
            head.enter().append('tr');
            
            head.selectAll('th')
                .data(function(d) { return d; })
                .enter()
                .append('th').html(function(d){ return d; });
                        
            var rows = d3.select('#data tbody')
                        .selectAll('tr')
                        .data(data, function(d) { return d.id; });
                        
            console.table(data);
                        
            rows.exit().remove();
            rows.enter().append('tr');
                            
            var cells = rows.selectAll('td')
                .data(function(d){
                    return keys.map(function(key) {
                        return d[key];
                    });
                });
            cells.exit().remove();
            cells.enter().append('td').html(function(d) { return d; });
        }

    }

    
// }(window);

