# README Modulo2 by Gerard and Alex Fernandez
​
# Project Name

Hacktivities
​
## Description
​
We will create a website that will allow us to subscribe to hacktivities or tours organized by other users (among individuals). These activities are spread throughout the cities (of Spain, Europe, world) and may be free or cost.
​
## User Stories
​
**404** - As a user I want to see a nice 404 page when I go to a page that doesn’t exist so that I know it was my fault
​
**500** - As a user I want to see a nice error page when the super team screws it up so that I know that is not my fault
​
**Homepage** - As a user I want to be able to access the homepage so that I see what the app is about and login and signup
​
**Sign up** - As a user I want to sign up on the webpage so that I can see all the events that I could attend
​
**Login** - As a user I want to be able to log in on the webpage so that I can get back to my account
​
**Logout** - As a user I want to be able to log out from the webpage so that I can make sure no one will access my account
​
**Events list** - As a user I want to see all the events available so that I can choose which ones I want to attend
​
**Events create** - As a user I want to create an event so that I can invite others to attend
​
**Events detail** - As a user I want to see the event details and attendee list of one event so that I can decide if I want to attend
​
**Attend event** - As a user I want to be able to attend to event so that the organizers can count me in
​
## Backlog
​
List of other features outside of the MVPs scope
​
User profile: - see my profile - upload my profile picture - update my profile info - list of events created by the user(en caso de que sea partner) - list events the user is attending 
Valorar: see other users profile(en principio no)

Checkout: Simulate the procces of suscribe to the hacktivity.

Homepage: - Show the best rates cities and the excursion
​
Geo Location: - add geolocation to events when creating - show event in a map in event detail page - show all events in a map in the event list page
​
## ROUTES:
​
| Method  | Endpoint  | Description  |
|---|---|---|
| GET  | /  |  HomePage |
| GET  | /about-us  |  Info about the company |

/activities
| GET  | /:cityName  |  List of all the excursions that have this city |
| GET  | /:cityName/:IDofactivitie  |  View the info related to the excursion vinculated with the city |
| GET  | /checkout  |  Page for complete the subscribtion to the event/excursion |

/user
| GET  | /login  | Login page  |
|  POST | /login  | Send user info and logged in  |
| GET  | /my-bookings  | List the excursion for do and also the completed  |
| GET  | /my-info  | Profile info where the user can change the parameters  | //:id de user
| GET  | /logout  | Login page  |

/partners (backlog)
| GET  | /my-ads or /my-activity  | List of the excursions that the partner offers and where he can see the number of normal users will assist to the event |
​
## Models REVISAR
​
User model
​
    {
    	username: String
    	password: String
    }
​
Hacktivity model
​
    { 
    	owner: ObjectId<User>
    	name: String
    	description: String
    	date: Date
    	location: cityid
    	+
    
    }

bookings(intermedia)

	{
		bookingID: //entendemos que se crea solo
		hactivityID:
		review/rating:
	}

Cities model

    {
    	city: String
    	country: String
		image: image
    }
    
​Comments model  //backlog

    {}



## Links
​
### Trello
​
https://trello.com/b/wXY0knUE/hacktivities
​
### Git
​
The url to your repository and to your deployed project
​
[Repository Link](https://github.com/alexfc96/hacktivities)
​
[Deploy Link](https://hacktivities.herokuapp.com/)
​
### Slides
​
[Slides Link](http://slides.com/)