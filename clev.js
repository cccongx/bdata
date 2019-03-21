data_array = data.features

var street_names = [] //list of street names
var street_map = {} //maps each meter index to street
var street_map_objects = {} //maps each meter object to street
var street_map_array = []
var street_avg_lat_lon = [] //maps each avg lat-lon to streets
var free_parking_times = [] //list of unique free parking times
var free_parking_count = [] //count for number of meters for each free parking time

for(i=0; i<(data_array.length); i++) {
	var street = data_array[i].properties.STREET
	var free = data_array[i].properties.PARK_NO_PAY

	if(!(street_names.includes(street))) {
		street_names.push(street)
	}

	if(street_map[street]) {
		street_map[street].push(i)
	}
	else {
		street_map[street] = [i]

	}
	if(street_map_objects[street]) {
		street_map_objects[street].push(data_array[i])
	}
	else {
		street_map_objects[street] = [data_array[i]]
	}

	if(!(free_parking_times.includes(free))) {
		free_parking_times.push(free)
	}

	if(free_parking_count[free]) {
		free_parking_count[free].push(i)
	}
	else {
		free_parking_count[free] = [i]
	}

}

for(i=0; i<street_names.length; i++) {
	var street = street_names[i]
	var meter_array = [] //list of all parking meter objects on this street
	for(j=0; j<data_array.length; j++) {
		var this_street = data_array[j].properties.STREET
		var meter = data_array[j]		
		if(street == this_street) {
			meter_array.push(meter)
		}
	}
	street_map_array.push({[street]: meter_array})
}

street_names.sort()	//Alphabetize list of street names

for(i=0; i<street_names.length; i++) {
	var street = street_names[i]
	var lat_lon_array = [] //list of all lat_lon of parking meters on this street
	for(j=0; j<data_array.length; j++) {
		var this_street = data_array[j].properties.STREET
		var geometry = data_array[j].geometry

		if(geometry != null) {
			var lat_lon = data_array[j].geometry.coordinates
		}
		if(street == this_street) {
			lat_lon_array.push(lat_lon)
		}
	}

	//get avg lat and lon for this street
	var avg_lat = 0
	var avg_lon = 0
	for(k=0; k<lat_lon_array.length; k++) {
		avg_lon += lat_lon_array[k][0]  //lon is 1st coord
		avg_lat += lat_lon_array[k][1]  //lat is 2nd coord
	}
	avg_lat /= lat_lon_array.length
	avg_lon /= lat_lon_array.length

	//push in form [lat, lon] for map
	street_avg_lat_lon.push({[street]: [avg_lat, avg_lon]})
}

//create options for select street
var street_frag = document.createDocumentFragment();
var opt = "Show all"
var el = document.createElement('option')
el.innerHTML = opt
el.value = opt
street_frag.appendChild(el)
for(var i=0; i<street_names.length; i++) {
	var opt = street_names[i]
	var el = document.createElement('option')
	el.innerHTML = opt
	el.value = opt
	street_frag.appendChild(el)
}

var selectedStreet = document.getElementById('selectStreet')
selectedStreet.appendChild(street_frag)


//create options for select time
var time_list = ["00:00AM", "01:00AM", "02:00AM", "03:00AM", "04:00AM", "05:00AM","06:00AM", "07:00AM", "08:00AM","09:00AM", "10:00AM", "11:00AM","12:00PM", "01:00PM", "02:00PM", "03:00PM", "04:00PM", "05:00PM", "06:00PM", "07:00PM", "08:00PM", "09:00PM", "10:00PM", "11:00PM"]
var time_frag = document.createDocumentFragment();
var time_frag2 = document.createDocumentFragment();
for(var i=0; i<time_list.length; i++) {
	var time_opt = time_list[i]
	var time_el = document.createElement('option')
	var time_el2 = document.createElement('option')
	time_el.innerHTML = time_opt
	time_el.value = time_opt
	time_el2.innerHTML = time_opt
	time_el2.value = time_opt
	time_frag.appendChild(time_el)
	time_frag2.appendChild(time_el2)
	//console.log(time_frag)
	//console.log(time_frag2)
}
var selectedTime = document.getElementById('selectTime')
var selectedTime2 = document.getElementById('selectTime2')
selectedTime.appendChild(time_frag)
//selectedTime2.appendChild(time_frag2)


//create options for select day
var day_list = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
var day_frag = document.createDocumentFragment();
for(var i=0; i<day_list.length; i++) {
	var day_opt = day_list[i]
	var day_el = document.createElement('option')
	day_el.innerHTML = day_opt
	day_el.value = day_opt
	day_frag.appendChild(day_el)
}
var selectedDay = document.getElementById('selectDay')
selectedDay.appendChild(day_frag)


//displays [lat, lon] array of avg coordinates when street is selected
var coord_obj
function displayStreetCoords() {
	var name = document.getElementById('selectStreet').value
	var time = document.getElementById('selectTime').value
	var day = document.getElementById('selectDay').value
	//console.log(name)
	var street_index = street_names.indexOf(name)
	//console.log(street_index)
	if(name == "Choose a street" || name == "Show all") {
		map.setCenter(center)
		map.setZoom(defaultZoom)
	}
	else {
		var coords = Object.values(street_avg_lat_lon[street_index])[0]
		console.log(coords)
		coord_obj = {lat: coords[0], lng: coords[1]}
		map.setZoom(18)
		map.panTo(coord_obj)
		return coord_obj
	}
	if(time != "Choose time" && day != "Choose day") {
		displayFreeMeters()
	}
}


function displayFreeMeters() {
	var time = document.getElementById('selectTime').value
	var day = document.getElementById('selectDay').value
	if(time != "Choose time" && day != "Choose day") {
		clearMap();
		meters = getFreeMeters(day, time);
		meters_coords_list = getFreeMeterCoords(meters);
		console.log(meters)
		console.log(meters_coords_list)
		addMarkers(meters_coords_list)
	}

}

/*function displayFreeMeterCoords() {
	var time = document.getElementById('selectTime').value
	var day = document.getElementById('selectDay').value
	console.log(time)
	console.log(day)
	if(!(time == "Choose time")) {
		meter_coords = getFreeMeterCoords(day, time)
		console.log(meter_coords)
		document.getElementById("meter_res").innerHTML = meter_coords
	}
}*/

//curr_time = "09:20AM"
//curr_day = "SUN"

//var ex_range = "00:00AM-04:00PM MON-FRI"
//var ex_day = "MON"
//var ex_time = "09:00AM"


var all_time_ranges = [] //all unique time ranges for free parking

//returns list of all meters free at given time and day
function getFreeMeters(ex_day, ex_time) {
	var free_meters = [] //list of meters free at given time

	for(i=0; i<data_array.length; i++) {
		var meter = data_array[i].properties
		var no_pay = data_array[i].properties.PARK_NO_PAY
		var time_array = []
		if(no_pay != null) {
			time_array = no_pay.split(",").map(item => item.trim()) //array of free parking ranges for this meter
			for(j=0; j<time_array.length; j++) {
				if(!(all_time_ranges.includes(time_array[j]))) {
					all_time_ranges.push(time_array[j])
					//console.log(all_time_ranges)
					//console.log(i)
				}
			}
		}
		var is_free_now = false
		for(var j=0; j<time_array.length; j++) { //iterate through each time range
			if(in_range(ex_day, ex_time, time_array[j])) {
				var is_free_now = true
			} 
		}
		if(is_free_now) {
			free_meters.push(i)
		}
	}
	return free_meters
}
//example inputs


function in_range(day, time, range) {
	//console.log(time)
	var start_time = range.substring(0, 7)
	var end_time = range.substring(8, 15)
	var start_day = range.substring(16, 19)
	var end_day = range.substring(20)
	var day_range = range.substring(16)
	var start_num = start_time.substring(0,5)
	var end_num = end_time.substring(0,5)
	var time_num = time.substring(0, 5)
	var in_time_range = false
	var in_day_range = false

	//check if in time range
	if(start_time.includes("AM")) {
		if(end_time == "24:00AM") {
			if(time_num >= start_num) {
				in_time_range = true
			}
		}
		else if(end_time.includes("AM")) { //start time AM, end time AM
			if(time.includes("AM") && time_num >= start_num && time_num < end_num) {
				in_time_range = true
			}
		}
		else { //start time AM, end time PM
			if(time.includes("AM") && time_num >= start_num) {
				in_time_range = true
			}
			else if(time.includes("PM")) {
				if(time == "12:00PM") {
					if(end_num != "12:00") {
						in_time_range = true
					}
				}
				else {
					if(time_num < end_num) {
						in_time_range = true
					}
				}

			}
		}
	}
	else { //start time PM
		if(time == "12:00PM") {
			if(start_num == "12:00") {
				in_time_range = true
			}
		}
		else if(time.includes("PM")) {
			if(time_num >= start_num && time_num < end_num) {
				in_time_range = true
			}
		}
	}

	//check if in day range
	if(end_day == "") { //only one day
		if(start_day == day) {
			in_day_range = true
		}
	}
	else { //range of days
		if(day_range == "SUN-FRI") {
			if(day != "SAT") {
				in_day_range = true
			}
		}
		else if(day_range == "SUN-SAT") {
			in_day_range = true
		}
		else if(day_range == "MON-FRI") {
			if(day != "SAT" && day != "SUN") {
				in_day_range = true
			}
		}
		else if(day_range == "MON-SAT") {
			if(day != "SUN") {
				in_day_range = true
			}
		}
	}

	return in_day_range && in_time_range
}


//takes list of free meters and returns list of their coordinates
function getFreeMeterCoords(meter_index_list) {
	coord_list = []
	for(var i=0; i<meter_index_list.length; i++) {
		meter_index = meter_index_list[i]
		lat = data_array[meter_index].properties.LATITUDE
		lng = data_array[meter_index].properties.LONGITUDE
		if(lat != null || lng != null) coord_list.push({lat, lng})
	}
	return coord_list
}



//console.log(in_range(ex_day, "24:00AM", "00:00AM-24:00AM SUN"))
//console.log(in_range(ex_day, "08:00AM", "00:00AM-08:00AM MON-SAT"))
//console.log(in_range(ex_day, "06:00AM", "07:00AM-08:00AM MON-SAT"))
//console.log(in_range(ex_day, "02:00PM", "00:00AM-04:00PM MON-SAT"))
//console.log(in_range(ex_day, "02:00PM", "00:00AM-08:00AM MON-SAT"))
//console.log(in_range(ex_day, "02:00PM", "00:00AM-08:00PM MON"))