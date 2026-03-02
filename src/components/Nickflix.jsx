import './Nickflix.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../supabase'

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN
const TMDB_BASE  = 'https://api.themoviedb.org/3'
const TMDB_IMG   = 'https://image.tmdb.org/t/p'

const tmdb = async (path, params = {}) => {
  const url = new URL(`${TMDB_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TMDB_TOKEN}`, 'Content-Type': 'application/json' } })
  return res.json()
}

const MASTER_LIST = {
  'Crime': [
    { title: 'The Godfather', year: 1972 },{ title: 'The Godfather Part II', year: 1974 },{ title: 'Goodfellas', year: 1990 },
    { title: 'Scarface', year: 1983 },{ title: 'Casino', year: 1995 },{ title: 'Heat', year: 1995 },
    { title: 'L.A. Confidential', year: 1997 },{ title: 'Training Day', year: 2001 },{ title: 'American Gangster', year: 2007 },
    { title: 'City of God', year: 2002 },{ title: 'The Town', year: 2010 },{ title: 'American History X', year: 1998 },
    { title: 'American Psycho', year: 2000 },{ title: 'A Bronx Tale', year: 1993 },{ title: 'Killing Them Softly', year: 2012 },
    { title: 'Fargo', year: 1996 },{ title: 'The Boondock Saints', year: 1999 },{ title: 'The French Connection', year: 1971 },
    { title: 'Once Upon a Time in America', year: 1984 },{ title: 'Cop Land', year: 1997 },{ title: 'The Accountant', year: 2016 },
    { title: 'Leon: The Professional', year: 1994 },{ title: 'Falling Down', year: 1993 },{ title: 'Lawless', year: 2012 },
    { title: 'Manhunter', year: 1986 },{ title: "Carlito's Way", year: 1993 },{ title: 'Serpico', year: 1973 },
    { title: 'Dog Day Afternoon', year: 1975 },{ title: 'Donnie Brasco', year: 1997 },{ title: 'Scent of a Woman', year: 1992 },
    { title: "The Devil's Advocate", year: 1997 },{ title: 'Taxi Driver', year: 1976 },{ title: 'Mean Streets', year: 1973 },
    { title: 'Cape Fear', year: 1991 },{ title: 'The Irishman', year: 2019 },{ title: 'Midnight Run', year: 1988 },
    { title: 'Road to Perdition', year: 2002 },{ title: 'Zodiac', year: 2007 },{ title: 'Kiss Kiss Bang Bang', year: 2005 },
    { title: 'The Talented Mr. Ripley', year: 1999 },{ title: 'The Drop', year: 2014 },{ title: 'Man on Fire', year: 2004 },
    { title: 'Inside Man', year: 2006 },{ title: 'Glory', year: 1989 },{ title: 'Malcolm X', year: 1992 },
    { title: 'Se7en', year: 1995, tmdbId: 807 },{ title: 'A Beautiful Mind', year: 2001 },{ title: 'Catch Me If You Can', year: 2002 },
  ],
  'Thriller': [
    { title: 'Mystic River', year: 2003 },{ title: 'Chinatown', year: 1974 },{ title: 'The Silence of the Lambs', year: 1991 },
    { title: 'The Usual Suspects', year: 1995 },{ title: 'Twelve Monkeys', year: 1995 },{ title: 'Primal Fear', year: 1996 },
    { title: 'The Game', year: 1997 },{ title: 'Memento', year: 2000 },{ title: 'Fallen', year: 1998 },
    { title: 'Donnie Darko', year: 2001 },{ title: 'Oldboy', year: 2003, tmdbId: 670 },{ title: 'Collateral', year: 2004 },
    { title: 'V for Vendetta', year: 2005 },{ title: 'The Prestige', year: 2006 },{ title: 'The Departed', year: 2006 },
    { title: 'Taken', year: 2008 },{ title: 'Prisoners', year: 2013 },{ title: 'Gone Girl', year: 2014 },
    { title: 'Parasite', year: 2019, tmdbId: 496243 },{ title: 'Insomnia', year: 2002 },{ title: 'Mississippi Burning', year: 1988 },
    { title: 'Enemy of the State', year: 1998 },{ title: 'Night Moves', year: 1975 },{ title: 'The Conversation', year: 1974 },
    { title: 'Marathon Man', year: 1976 },{ title: "All the President's Men", year: 1976 },{ title: 'Straw Dogs', year: 1971 },
    { title: '21 Grams', year: 2003 },{ title: "Before the Devil Knows You're Dead", year: 2007 },
    { title: 'The Ides of March', year: 2011 },{ title: 'Crimson Tide', year: 1995 },{ title: 'The Pelican Brief', year: 1993 },
    { title: 'Flight', year: 2012 },{ title: 'Swimming with Sharks', year: 1994 },{ title: 'The Negotiator', year: 1998 },
    { title: 'The Insider', year: 1999 },{ title: 'No Country for Old Men', year: 2007 },{ title: 'The Fugitive', year: 1993 },
    { title: 'JFK', year: 1991 },{ title: 'Men in Black', year: 1997 },{ title: 'King of New York', year: 1990 },
  ],
  'Drama': [
    { title: 'Sleepers', year: 1996 },{ title: 'Stand by Me', year: 1986 },{ title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Outsiders', year: 1983 },{ title: 'The Patriot', year: 2000 },{ title: 'American Beauty', year: 1999 },
    { title: 'American Graffiti', year: 1973 },{ title: 'Papillon', year: 1973 },{ title: 'Life is Beautiful', year: 1997 },
    { title: 'Good Will Hunting', year: 1997 },{ title: 'Dead Poets Society', year: 1989 },{ title: 'The Fisher King', year: 1991 },
    { title: 'Awakenings', year: 1990 },{ title: 'Dead Man Walking', year: 1995 },{ title: 'Milk', year: 2008 },
    { title: 'Philadelphia', year: 1993 },{ title: 'Forrest Gump', year: 1994 },{ title: 'Cast Away', year: 2000 },
    { title: 'The Green Mile', year: 1999 },{ title: 'Rounders', year: 1998 },{ title: 'The Martian', year: 2015 },
    { title: 'Capote', year: 2005 },{ title: 'Doubt', year: 2008 },{ title: 'The Master', year: 2012 },
    { title: 'Magnolia', year: 1999 },{ title: "Charlie Wilson's War", year: 2007 },{ title: 'Midnight Cowboy', year: 1969 },
    { title: 'Kramer vs. Kramer', year: 1979 },{ title: 'Rain Man', year: 1988 },{ title: 'Tootsie', year: 1982 },
    { title: 'Oppenheimer', year: 2023 },{ title: 'Fences', year: 2016 },{ title: 'The Hurricane', year: 1999 },
    { title: 'The Bucket List', year: 2007 },{ title: 'Fast Times at Ridgemont High', year: 1982 },
    { title: 'Cinderella Man', year: 2005 },{ title: 'Master and Commander', year: 2003 },{ title: 'The Apostle', year: 1997 },
    { title: 'Tender Mercies', year: 1983 },{ title: 'To Kill a Mockingbird', year: 1962 },{ title: 'MASH', year: 1970 },{ title: 'The Great Santini', year: 1979 },
  ],
  'Comedy': [
    { title: 'Blazing Saddles', year: 1974 },{ title: 'Caddyshack', year: 1980 },{ title: 'The Blues Brothers', year: 1980 },
    { title: 'Office Space', year: 1999 },{ title: 'Dumb and Dumber', year: 1994 },{ title: 'Happy Gilmore', year: 1996 },
    { title: 'Blades of Glory', year: 2007 },{ title: 'Grown Ups', year: 2010 },{ title: 'The Big Lebowski', year: 1998 },
    { title: 'Kingpin', year: 1996 },{ title: 'Step Brothers', year: 2008 },{ title: 'Talladega Nights', year: 2006 },
    { title: 'Meet the Parents', year: 2000 },{ title: 'Analyze This', year: 1999 },{ title: 'Analyze That', year: 2002 },
    { title: 'Ace Ventura: Pet Detective', year: 1994 },{ title: 'Lock, Stock and Two Smoking Barrels', year: 1998 },
    { title: 'Snatch', year: 2000 },{ title: 'Trading Places', year: 1983 },{ title: 'Ghostbusters', year: 1984 },
    { title: 'Coming to America', year: 1988 },{ title: 'Napoleon Dynamite', year: 2004 },{ title: 'Groundhog Day', year: 1993 },
    { title: 'Harold & Kumar Go to White Castle', year: 2004 },{ title: "Brewster's Millions", year: 1985 },
    { title: 'The Nutty Professor', year: 1996 },{ title: 'Mrs. Doubtfire', year: 1993 },{ title: 'Good Morning, Vietnam', year: 1987 },
    { title: 'Beverly Hills Cop', year: 1984 },{ title: 'School of Rock', year: 2003 },{ title: 'Night at the Museum', year: 2006 },
    { title: 'Tropic Thunder', year: 2008 },{ title: "Ferris Bueller's Day Off", year: 1986 },{ title: 'Back to the Future', year: 1985 },
    { title: 'Billy Madison', year: 1995 },{ title: 'The Waterboy', year: 1998 },{ title: 'The Wedding Singer', year: 1998 },
    { title: 'Big Daddy', year: 1999 },{ title: '50 First Dates', year: 2004 },{ title: 'Click', year: 2006 },
    { title: 'Anger Management', year: 2003 },{ title: 'Uncut Gems', year: 2019 },{ title: 'Zoolander', year: 2001 },
    { title: "There's Something About Mary", year: 1998 },{ title: 'Heavyweights', year: 1995 },
    { title: 'Along Came Polly', year: 2004 },{ title: 'Elf', year: 2003 },
    { title: 'Anchorman: The Legend of Ron Burgundy', year: 2004 },{ title: 'Old School', year: 2003 },
    { title: 'The Other Guys', year: 2010 },{ title: 'Stranger Than Fiction', year: 2006 },
    { title: 'Pineapple Express', year: 2008 },{ title: 'This Is the End', year: 2013 },
    { title: 'Lost in Translation', year: 2003 },{ title: 'Stripes', year: 1981 },{ title: 'Rushmore', year: 1998 },
    { title: 'What About Bob?', year: 1991 },{ title: 'The Jerk', year: 1979 },
    { title: 'Planes, Trains and Automobiles', year: 1987 },{ title: 'Home Alone', year: 1990 },{ title: 'My Cousin Vinny', year: 1992 },
  ],
  'Horror': [
    { title: 'Halloween', year: 1978 },{ title: 'The Shining', year: 1980 },{ title: 'The Exorcist', year: 1973 },
    { title: 'Jaws', year: 1975 },{ title: 'The Thing', year: 1982 },{ title: 'Aliens', year: 1986 },
    { title: 'Carrie', year: 1976 },{ title: 'Scream', year: 1996 },{ title: 'Get Out', year: 2017 },
    { title: 'Hereditary', year: 2018 },{ title: 'Midsommar', year: 2019 },{ title: 'The Witch', year: 2015 },
    { title: 'It Follows', year: 2014 },{ title: 'A Quiet Place', year: 2018 },{ title: 'Bird Box', year: 2018 },
    { title: 'The Mist', year: 2007 },{ title: 'Saw', year: 2004 },{ title: 'The Dead Zone', year: 1983 },
    { title: 'The Wicker Man', year: 1973 },{ title: 'Suspiria', year: 1977 },{ title: "Rosemary's Baby", year: 1968 },
    { title: 'The Babadook', year: 2014 },{ title: 'Annihilation', year: 2018 },{ title: 'The Lighthouse', year: 2019 },
    { title: 'Shadow of the Vampire', year: 2000 },{ title: 'The Florida Project', year: 2017 },
  ],
  'Fantasy': [
    { title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001 },{ title: 'The Lord of the Rings: The Two Towers', year: 2002 },
    { title: 'The Lord of the Rings: The Return of the King', year: 2003 },{ title: 'The Princess Bride', year: 1987 },
    { title: 'Willow', year: 1988 },{ title: 'Conan the Barbarian', year: 1982 },{ title: 'Excalibur', year: 1981 },
    { title: 'The Wizard of Oz', year: 1939 },{ title: 'Matilda', year: 1996 },{ title: 'The Mummy', year: 1999 },
    { title: 'Hugo', year: 2011 },{ title: 'Alice in Wonderland', year: 2010 },{ title: "Pan's Labyrinth", year: 2006 },
    { title: 'The Shape of Water', year: 2017 },{ title: 'Labyrinth', year: 1986 },{ title: 'Edward Scissorhands', year: 1990 },
    { title: 'Big Fish', year: 2003 },{ title: 'Harry Potter and the Prisoner of Azkaban', year: 2004 },
  ],
  'Action': [
    { title: 'Indiana Jones and the Raiders of the Lost Ark', year: 1981 },{ title: 'The Terminator', year: 1984 },
    { title: 'Die Hard', year: 1988 },{ title: 'Dirty Harry', year: 1971 },{ title: 'Inception', year: 2010 },
    { title: 'The Matrix', year: 1999 },{ title: 'Top Gun', year: 1986 },{ title: 'The Untouchables', year: 1987 },
    { title: 'Predator', year: 1987 },{ title: 'Lethal Weapon', year: 1987 },{ title: 'John Wick', year: 2014 },
    { title: 'Kingsman: The Secret Service', year: 2014 },{ title: 'GoldenEye', year: 1995 },
    { title: 'From Russia with Love', year: 1963 },{ title: 'The Bourne Identity', year: 2002 },
    { title: 'Patriot Games', year: 1992 },{ title: 'First Blood', year: 1982 },{ title: 'Jack Reacher', year: 2012 },
    { title: 'The Equalizer', year: 2014 },{ title: 'Kick-Ass', year: 2010 },{ title: 'Bad Boys', year: 1995 },
    { title: 'Point Break', year: 1991 },{ title: 'Natural Born Killers', year: 1994 },{ title: 'Tango & Cash', year: 1989 },
    { title: 'Escape from New York', year: 1981 },{ title: 'Big Trouble in Little China', year: 1986 },
    { title: 'Tombstone', year: 1993 },{ title: 'Backdraft', year: 1991 },{ title: 'Breakdown', year: 1997 },
    { title: 'Unforgiven', year: 1992 },{ title: 'Gran Torino', year: 2008 },{ title: 'Escape from Alcatraz', year: 1979 },
    { title: 'The Good, the Bad and the Ugly', year: 1966 },{ title: 'A Fistful of Dollars', year: 1964 },
    { title: 'The Outlaw Josey Wales', year: 1976 },{ title: 'Batman', year: 1989 },{ title: 'A Few Good Men', year: 1992 },
    { title: 'Blade Runner', year: 1982 },{ title: 'Witness', year: 1985 },{ title: 'Air Force One', year: 1997 },
    { title: 'Clear and Present Danger', year: 1994 },{ title: 'Batman Begins', year: 2005 },
    { title: 'The Dark Knight', year: 2008 },{ title: 'Rescue Dawn', year: 2006 },{ title: '3:10 to Yuma', year: 2007 },
    { title: 'Fear and Loathing in Las Vegas', year: 1998 },{ title: 'Blow', year: 2001 },
    { title: 'Pirates of the Caribbean: The Curse of the Black Pearl', year: 2003 },{ title: 'Iron Man', year: 2008 },
    { title: 'Sherlock Holmes', year: 2009 },{ title: 'Mad Max', year: 1979 },{ title: 'Apocalypto', year: 2006 },
    { title: 'Ransom', year: 1996 },{ title: 'Lone Survivor', year: 2013 },{ title: 'Four Brothers', year: 2005 },
    { title: 'Under Siege', year: 1992 },{ title: 'Gladiator', year: 2000 },
  ],
  'Animation': [
    { title: 'Dumbo', year: 1941 },{ title: 'Toy Story', year: 1995 },{ title: 'Spider-Man: Into the Spider-Verse', year: 2018 },
    { title: 'Finding Nemo', year: 2003 },{ title: 'The Incredibles', year: 2004 },{ title: 'Monsters, Inc.', year: 2001 },
    { title: 'The Jungle Book', year: 1967 },{ title: 'Wreck-It Ralph', year: 2012 },{ title: 'Over the Hedge', year: 2006 },
    { title: 'Open Season', year: 2006 },{ title: 'Chicken Run', year: 2000 },{ title: '101 Dalmatians', year: 1961 },
    { title: 'Fantastic Mr. Fox', year: 2009 },{ title: 'Kung Fu Panda', year: 2008 },{ title: 'Big Hero 6', year: 2014 },
    { title: 'Moana', year: 2016 },{ title: "A Bug's Life", year: 1998, tmdbId: 9487 },{ title: 'The Croods', year: 2013 },
    { title: 'Shrek', year: 2001 },{ title: 'Aladdin', year: 1992 },{ title: 'Grave of the Fireflies', year: 1988, tmdbId: 12477 },
    { title: 'Spirited Away', year: 2001, tmdbId: 129 },{ title: 'Princess Mononoke', year: 1997, tmdbId: 128 },
    { title: 'The Iron Giant', year: 1999 },{ title: 'WALL-E', year: 2008, tmdbId: 10681 },
  ],
  'Sports': [
    { title: 'Rocky', year: 1976 },{ title: 'Rocky II', year: 1979 },{ title: 'Raging Bull', year: 1980 },
    { title: 'The Hustler', year: 1961 },{ title: 'Hoosiers', year: 1986 },{ title: 'Moneyball', year: 2011 },
    { title: 'The Karate Kid', year: 1984 },{ title: 'Million Dollar Baby', year: 2004 },{ title: 'Jerry Maguire', year: 1996 },
    { title: 'Dodgeball: A True Underdog Story', year: 2004 },{ title: 'The Benchwarmers', year: 2006 },
    { title: 'Rush', year: 2013 },{ title: 'Major League', year: 1989 },{ title: 'The Fighter', year: 2010 },
    { title: 'Invincible', year: 2006 },{ title: 'Miracle', year: 2004 },{ title: 'A League of Their Own', year: 1992 },
    { title: 'Slap Shot', year: 1977 },{ title: 'Hustle', year: 2022 },{ title: 'Draft Day', year: 2014 },
    { title: 'Remember the Titans', year: 2000 },{ title: 'He Got Game', year: 1998 },
  ],
  'War': [
    { title: 'Apocalypse Now', year: 1979 },{ title: "Schindler's List", year: 1993 },{ title: 'Platoon', year: 1986 },
    { title: 'Full Metal Jacket', year: 1987 },{ title: 'The Great Escape', year: 1963 },
    { title: 'The Bridge on the River Kwai', year: 1957 },{ title: 'The Deer Hunter', year: 1978 },
    { title: 'Stalag 17', year: 1953 },{ title: 'Paths of Glory', year: 1957 },{ title: 'Black Hawk Down', year: 2001 },
    { title: 'Hacksaw Ridge', year: 2016 },{ title: 'Casualties of War', year: 1989 },{ title: 'Jarhead', year: 2005 },
    { title: 'Come and See', year: 1985, tmdbId: 11849 },{ title: 'Das Boot', year: 1981, tmdbId: 387 },
    { title: '1917', year: 2019 },{ title: 'Fury', year: 2014 },{ title: 'Dunkirk', year: 2017 },
    { title: 'Gallipoli', year: 1981 },{ title: 'The Thin Red Line', year: 1998 },{ title: 'Valkyrie', year: 2008 },
    { title: 'Empire of the Sun', year: 1987 },{ title: 'Letters from Iwo Jima', year: 2006 },
    { title: 'Greyhound', year: 2020 },{ title: 'The Covenant', year: 2023 },{ title: 'Saving Private Ryan', year: 1998 },
  ],
  'Romance': [
    { title: 'When Harry Met Sally...', year: 1989 },{ title: 'Notting Hill', year: 1999 },
    { title: 'Pretty Woman', year: 1990 },{ title: 'Sleepless in Seattle', year: 1993 },
    { title: "You've Got Mail", year: 1998 },{ title: 'The Notebook', year: 2004 },{ title: 'Roman Holiday', year: 1953 },
    { title: 'Casablanca', year: 1942 },{ title: 'Brief Encounter', year: 1945 },{ title: 'Love Actually', year: 2003 },
    { title: "My Best Friend's Wedding", year: 1997 },{ title: 'Runaway Bride', year: 1999 },
    { title: 'An Officer and a Gentleman', year: 1982 },{ title: 'Chicago', year: 2002 },
  ],
  'Old Movies': [
    { title: 'Vertigo', year: 1958 },{ title: 'Rear Window', year: 1954 },{ title: 'The Birds', year: 1963 },
    { title: 'Rope', year: 1948 },{ title: 'North by Northwest', year: 1959 },{ title: 'Notorious', year: 1946 },
    { title: '12 Angry Men', year: 1957 },{ title: 'The Maltese Falcon', year: 1941 },{ title: 'Some Like It Hot', year: 1959 },
    { title: 'Sunset Blvd.', year: 1950, tmdbId: 5765 },{ title: 'Casablanca', year: 1942 },
    { title: 'Seven Samurai', year: 1954, tmdbId: 346 },{ title: 'The Treasure of the Sierra Madre', year: 1948 },
    { title: 'Ben-Hur', year: 1959 },{ title: 'Lawrence of Arabia', year: 1962 },{ title: 'Double Indemnity', year: 1944 },
    { title: 'The Apartment', year: 1960 },{ title: 'Cool Hand Luke', year: 1967 },
    { title: 'Butch Cassidy and the Sundance Kid', year: 1969 },{ title: 'The Graduate', year: 1967 },
    { title: "One Flew Over the Cuckoo's Nest", year: 1975 },{ title: 'Spartacus', year: 1960 },
    { title: 'Goldfinger', year: 1964 },{ title: 'Mary Poppins', year: 1964 },{ title: 'The Cincinnati Kid', year: 1965 },
    { title: "Breakfast at Tiffany's", year: 1961 },{ title: 'The Big Sleep', year: 1946 },
    { title: 'The African Queen', year: 1951 },{ title: 'Key Largo', year: 1948 },{ title: 'Network', year: 1976 },
    { title: 'The Wild Bunch', year: 1969 },{ title: 'The Odd Couple', year: 1968 },
    { title: 'Glengarry Glen Ross', year: 1992 },{ title: 'The Sting', year: 1973 },{ title: 'Easy Rider', year: 1969 },
    { title: 'Five Easy Pieces', year: 1970 },{ title: "It's a Wonderful Life", year: 1946 },
    { title: 'Mr. Smith Goes to Washington', year: 1939 },{ title: 'Harvey', year: 1950 },
    { title: 'Once Upon a Time in the West', year: 1968 },{ title: 'The Grapes of Wrath', year: 1940 },
    { title: 'Kind Hearts and Coronets', year: 1949 },{ title: 'Ace in the Hole', year: 1951 },
    { title: 'Lust for Life', year: 1956 },{ title: 'To Sir, with Love', year: 1967 },
    { title: 'In the Heat of the Night', year: 1967 },{ title: "Guess Who's Coming to Dinner", year: 1967 },
  ],
  'Tarantino': [
    { title: 'Pulp Fiction', year: 1994 },{ title: 'Reservoir Dogs', year: 1992 },{ title: 'True Romance', year: 1993 },
    { title: 'Kill Bill: Vol. 1', year: 2003 },{ title: 'Kill Bill: Vol. 2', year: 2004 },
    { title: 'Inglourious Basterds', year: 2009 },{ title: 'Django Unchained', year: 2012 },
    { title: 'Jackie Brown', year: 1997 },{ title: 'The Hateful Eight', year: 2015 },
    { title: 'Once Upon a Time in Hollywood', year: 2019 },{ title: 'Death Proof', year: 2007 },{ title: 'From Dusk Till Dawn', year: 1996 },
  ],
  'Overrated': [
    { title: 'Shutter Island', year: 2010 },{ title: 'Inception', year: 2010 },{ title: 'Superbad', year: 2007 },
    { title: 'The Exorcist', year: 1973 },{ title: 'The Shining', year: 1980 },
    { title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001 },{ title: 'Saving Private Ryan', year: 1998 },
    { title: 'Mulholland Drive', year: 2001 },
  ],
  'Underrated': [
    { title: 'The Dead Zone', year: 1983 },{ title: 'Harry Potter and the Prisoner of Azkaban', year: 2004 },
    { title: 'The Benchwarmers', year: 2006 },{ title: 'Cop Land', year: 1997 },
  ],
}

const buildAll = () => {
  const seen = new Set(); const all = []
  Object.values(MASTER_LIST).forEach(films => films.forEach(f => {
    const key = `${f.title}:${f.year}`
    if (!seen.has(key)) { seen.add(key); all.push(f) }
  }))
  return all
}

const GENRES = ['All', ...Object.keys(MASTER_LIST)]

const ACTORS = [
  { name: 'Al Pacino', tier: 'S', desc: "The explosion. If there's one actor in this entire list who defines your taste, it's Pacino.", films: "Godfather I & II, Scarface, Heat, Carlito's Way, Serpico, Dog Day Afternoon, Scent of a Woman, The Devil's Advocate, Donnie Brasco" },
  { name: 'Robert De Niro', tier: 'S', desc: "The chameleon. Pacino's eternal counterpart.", films: 'Goodfellas, Casino, The Godfather II, Taxi Driver, Raging Bull, Mean Streets, The Irishman, Heat, A Bronx Tale, Cape Fear, The Deer Hunter, Midnight Run' },
  { name: 'Jack Nicholson', tier: 'S', desc: "The natural. You made yourself like The Shining just for him — says everything.", films: "One Flew Over the Cuckoo's Nest, Chinatown, The Shining, A Few Good Men, The Departed, As Good as It Gets, Batman, Five Easy Pieces" },
  { name: 'Joe Pesci', tier: 'A', desc: 'Terrifying, hilarious, and often both in the same scene.', films: 'Goodfellas, Casino, Raging Bull, My Cousin Vinny, Home Alone, The Irishman, JFK' },
  { name: 'Clint Eastwood', tier: 'A', desc: 'Your Western god.', films: 'Dirty Harry, Unforgiven, Gran Torino, The Good the Bad and the Ugly, Escape from Alcatraz' },
  { name: 'Gene Hackman', tier: 'A', desc: 'Possibly the most underrated legend in Hollywood history.', films: 'The French Connection, Unforgiven, Enemy of the State, Mississippi Burning, Hoosiers, The Conversation' },
  { name: 'Denzel Washington', tier: 'A', desc: 'The GOAT argument is fully legitimate.', films: 'Training Day, Malcolm X, Glory, Man on Fire, Crimson Tide, Remember the Titans, Fences, Flight' },
  { name: 'Sean Penn', tier: 'A', desc: 'Intense to the point of spontaneous combustion.', films: "Mystic River, Carlito's Way, Dead Man Walking, Milk, 21 Grams" },
  { name: 'Philip Seymour Hoffman', tier: 'A', desc: 'Range from pizza-grease comedy to Best Actor Oscar. Gone too soon.', films: "Capote, Magnolia, Boogie Nights, The Master, Doubt, Almost Famous, Along Came Polly" },
  { name: 'Brad Pitt', tier: 'A', desc: 'Spent a decade being dismissed as just a pretty face. Then Fight Club happened.', films: "Se7en, Fight Club, Inglourious Basterds, Fury, Moneyball, Snatch, Once Upon a Time in Hollywood" },
  { name: 'Edward Norton', tier: 'A', desc: 'Possibly the best pure acting debut in Hollywood history with Primal Fear.', films: 'American History X, Fight Club, Primal Fear, The Italian Job, 25th Hour' },
  { name: 'Gary Oldman', tier: 'A', desc: 'Disappears completely into every role.', films: 'Leon: The Professional, The Dark Knight, True Romance, JFK, Darkest Hour' },
  { name: 'Harvey Keitel', tier: 'A', desc: "Scorsese's original muse.", films: 'Pulp Fiction, Reservoir Dogs, Taxi Driver, Mean Streets, Bad Lieutenant, From Dusk Till Dawn' },
  { name: 'Julia Roberts', tier: 'A', desc: 'The last true Hollywood movie star in the classic sense.', films: "Pretty Woman, Erin Brockovich, My Best Friend's Wedding, Notting Hill" },
  { name: 'Natalie Portman', tier: 'A', desc: 'Started as a 12-year-old opposite Keitel and never looked back.', films: 'Leon: The Professional, Black Swan, Closer, V for Vendetta' },
  { name: 'Christopher Walken', tier: 'A', desc: 'Nobody on earth delivers a line like Walken.', films: 'The Deer Hunter, True Romance, King of New York, Catch Me If You Can' },
  { name: 'Christian Bale', tier: 'A', desc: 'Commits harder than anyone alive.', films: 'Batman Begins, The Dark Knight, The Fighter, American Psycho, The Prestige, 3:10 to Yuma' },
  { name: 'Robin Williams', tier: 'A', desc: 'Funniest man alive and one of the most devastating. Same person.', films: "Good Will Hunting, Dead Poets Society, Aladdin, Awakenings, Mrs. Doubtfire, Good Morning Vietnam" },
  { name: 'Kevin Spacey', tier: 'A', desc: 'Villain energy at all times, even playing the hero.', films: "The Usual Suspects, Se7en, L.A. Confidential, American Beauty, Swimming with Sharks" },
  { name: 'Harrison Ford', tier: 'A', desc: 'Never had a bad decade.', films: 'Indiana Jones, The Fugitive, Blade Runner, Air Force One, Patriot Games' },
  { name: 'Sylvester Stallone', tier: 'A', desc: 'Massively underrated as a serious actor when he actually tries.', films: 'Rocky I & II, First Blood, Cop Land' },
  { name: 'Mark Wahlberg', tier: 'A', desc: 'Best when gritty.', films: 'Boogie Nights, The Departed, The Fighter, Lone Survivor, Four Brothers' },
  { name: 'Robert Duvall', tier: 'A', desc: 'The most undersung legend in Hollywood.', films: 'The Godfather, Apocalypse Now, MASH, To Kill a Mockingbird, The Apostle, Tender Mercies' },
  { name: 'Tom Hanks', tier: 'A', desc: "On the overrated list and all over your movie list.", films: 'Forrest Gump, Cast Away, Philadelphia, The Green Mile, Road to Perdition' },
  { name: 'Russell Crowe', tier: 'B', desc: 'Massively underrated post-Gladiator.', films: "Gladiator, L.A. Confidential, The Insider, A Beautiful Mind, Cinderella Man" },
  { name: 'James Gandolfini', tier: 'B', desc: 'Not enough films but every single one counts.', films: 'The Sopranos, The Drop, Zero Dark Thirty' },
  { name: 'Steve Buscemi', tier: 'B', desc: 'Appears in nearly every film you love, usually stealing the scene.', films: 'Fargo, Reservoir Dogs, The Big Lebowski, Con Air' },
  { name: 'Johnny Depp', tier: 'B', desc: 'Pre-2010 Depp is a different human entirely.', films: 'Donnie Brasco, Fear and Loathing, Blow, Ed Wood, Pirates of the Caribbean' },
  { name: 'Adam Sandler', tier: 'B', desc: 'Uncut Gems proves he can genuinely act.', films: 'Happy Gilmore, Billy Madison, Uncut Gems, The Wedding Singer' },
  { name: 'Ben Stiller', tier: 'B', desc: 'King of 2000s comedy.', films: 'Zoolander, Tropic Thunder, Meet the Parents, Dodgeball, Along Came Polly' },
  { name: 'Will Ferrell', tier: 'B', desc: 'The comedy workhorse who also did a legitimately great drama.', films: 'Elf, Anchorman, Step Brothers, Talladega Nights, Old School, Stranger Than Fiction' },
  { name: 'Bill Murray', tier: 'B', desc: "Impossible to explain why he's this good. Just is.", films: 'Groundhog Day, Lost in Translation, Rushmore, Stripes, Ghostbusters' },
  { name: 'Tommy Lee Jones', tier: 'B', desc: "Gruff genius.", films: 'No Country for Old Men, The Fugitive, JFK, Under Siege, Men in Black' },
  { name: 'Morgan Freeman', tier: 'B', desc: "The voice of God.", films: "The Shawshank Redemption, Se7en, Unforgiven, Million Dollar Baby" },
  { name: 'Matt Damon', tier: 'B', desc: 'Mr. Consistent.', films: "Good Will Hunting, The Departed, Rounders, The Talented Mr. Ripley, The Martian" },
  { name: 'Kurt Russell', tier: 'B', desc: "Peak 80s/90s cool.", films: 'The Thing, Escape from New York, Tombstone, Tango & Cash, Big Trouble in Little China' },
  { name: 'Mel Gibson', tier: 'B', desc: "Best when barely holding it together.", films: 'Braveheart, Payback, Mad Max, Apocalypto, Ransom, The Patriot' },
  { name: 'Dustin Hoffman', tier: 'B', desc: 'Two Best Actor Oscars and somehow still underappreciated.', films: "Rain Man, Midnight Cowboy, Kramer vs. Kramer, Tootsie" },
  { name: 'Robert Downey Jr.', tier: 'B', desc: 'Nobody does charming and unhinged better.', films: 'Iron Man, Chaplin, Zodiac, Tropic Thunder, Oppenheimer, Sherlock Holmes' },
  { name: 'Richard Gere', tier: 'B', desc: 'Criminally overlooked as a serious actor.', films: 'Pretty Woman, Primal Fear, American Gigolo, Chicago, An Officer and a Gentleman' },
  { name: 'Jack Black', tier: 'B', desc: 'Constantly underestimated. School of Rock is a masterclass.', films: 'School of Rock, Tropic Thunder, High Fidelity, King Kong' },
  { name: 'Billy Crystal', tier: 'B', desc: 'The king of 90s comedy.', films: 'When Harry Met Sally, City Slickers, The Princess Bride, Analyze This' },
  { name: 'Humphrey Bogart', tier: 'G', desc: 'The OG. Every actor who came after owes him something.', films: 'Casablanca, The Maltese Falcon, The African Queen, The Big Sleep' },
  { name: 'James Stewart', tier: 'G', desc: "America's conscience on screen.", films: "It's a Wonderful Life, Rear Window, Vertigo, Mr. Smith Goes to Washington, Harvey" },
  { name: 'Henry Fonda', tier: 'G', desc: 'Righteous fury in human form.', films: '12 Angry Men, Once Upon a Time in the West, The Grapes of Wrath' },
  { name: 'Jack Lemmon', tier: 'G', desc: 'Invented the buddy dynamic.', films: 'Some Like It Hot, The Apartment, The Odd Couple, Glengarry Glen Ross' },
  { name: 'Paul Newman', tier: 'G', desc: 'Cool hand. Cool man. Cool everything.', films: 'The Hustler, Butch Cassidy, Cool Hand Luke, The Sting, Slap Shot' },
  { name: 'Steve McQueen', tier: 'G', desc: 'The King of Cool.', films: 'The Great Escape, Papillon, The Cincinnati Kid, Bullitt' },
  { name: 'Sidney Poitier', tier: 'G', desc: 'Paved every road that came after him.', films: "In the Heat of the Night, To Sir with Love, Guess Who's Coming to Dinner" },
  { name: 'Alec Guinness', tier: 'G', desc: 'British acting perfection. Eight roles in one film.', films: 'Bridge on the River Kwai, Kind Hearts and Coronets, Lawrence of Arabia' },
  { name: 'Kirk Douglas', tier: 'G', desc: 'The original Hollywood tough guy who also had a brain.', films: 'Spartacus, Paths of Glory, Ace in the Hole, Lust for Life' },
  { name: 'William Holden', tier: 'G', desc: 'The everyman who could carry absolutely anything.', films: "Sunset Blvd., Stalag 17, The Bridge on the River Kwai, Network" },
]

const TIER_LABELS = { S: 'S Tier — The Holy Trinity', A: 'A Tier — The Legends & Reliables', B: 'B Tier — The Specialists', G: 'Golden Age Legends' }
const TIER_COLORS = { S: '#f1c40f', A: '#c0392b', B: '#2980b9', G: '#8e44ad' }

const searchMovie = async ({ title, year, tmdbId }) => {
  try {
    if (tmdbId) { const d = await tmdb(`/movie/${tmdbId}`); return d?.id ? d : null }
    const data = await tmdb('/search/movie', { query: title, language: 'en-US' })
    const results = data.results || []
    const match = results.find(r => Math.abs(parseInt(r.release_date?.slice(0,4)) - year) <= 1)
    return match || results[0] || null
  } catch { return null }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

// Normalise a watchlist row into one or more activity events
function watchlistToEvents(row) {
  const events = []
  const base = { userId: row.user_id, timestamp: row.updated_at, posterPath: row.poster_path, movieTitle: row.title, tmdbId: row.tmdb_id }
  if (row.status === 'watched') events.push({ ...base, type: 'watched' })
  if (row.status === 'watchlist') events.push({ ...base, type: 'queued' })
  if (row.user_rating)  events.push({ ...base, type: 'rated',    rating: row.user_rating })
  if (row.comment)      events.push({ ...base, type: 'reviewed', comment: row.comment })
  if (row.recommended)  events.push({ ...base, type: 'recommended' })
  return events
}

// Describe an activity event as a sentence fragment
function eventDescription(ev, profileName) {
  const who = <strong style={{ color: '#e2e8f0' }}>{profileName}</strong>
  switch (ev.type) {
    case 'watched':     return <>{who} watched <em>{ev.movieTitle}</em></>
    case 'queued':      return <>{who} added <em>{ev.movieTitle}</em> to their watchlist</>
    case 'rated':       return <>{who} rated <em>{ev.movieTitle}</em> <span style={{ color:'#f5c518' }}>★ {ev.rating}/10</span></>
    case 'reviewed':    return <>{who} reviewed <em>{ev.movieTitle}</em></>
    case 'recommended': return <>{who} recommended <em>{ev.movieTitle}</em> 📣</>
    case 'actor_fav':   return <>{who} favourited <span style={{ color:'#ec4899' }}>♥ {ev.actorName}</span></>
    case 'actor_comment': return <>{who} commented on <span style={{ color:'#f5c518' }}>{ev.actorName}</span></>
    default:            return <>{who} did something</>
  }
}

const TYPE_ICON = {
  watched: '👁️', queued: '📋', rated: '⭐', reviewed: '✍️',
  recommended: '📣', actor_fav: '♥', actor_comment: '💬',
}
const TYPE_COLOR = {
  watched: '#22c55e', queued: '#3b82f6', rated: '#f5c518',
  reviewed: '#8b5cf6', recommended: '#f97316', actor_fav: '#ec4899', actor_comment: '#06b6d4',
}

// ─── STAR RATING ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="nf-stars">
      {[1,2,3,4,5,6,7,8,9,10].map(i => (
        <button key={i} className={`nf-star ${i <= (hover || value) ? 'lit' : ''}`}
          onClick={() => !readonly && onChange(i)}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => !readonly && setHover(0)}
          disabled={readonly} type="button">★</button>
      ))}
      {value > 0 && <span className="nf-star-val">{value}/10</span>}
    </div>
  )
}

// ─── SITE RATING ──────────────────────────────────────────────────────────────
function SiteRatingBlock({ allEntries }) {
  const rated = (allEntries || []).filter(e => e.user_rating)
  if (rated.length === 0) return null
  const avg = rated.reduce((s, e) => s + e.user_rating, 0) / rated.length
  const pct = (avg / 10) * 100
  const scoreColor = avg >= 8 ? '#22c55e' : avg >= 6 ? '#f5c518' : avg >= 4 ? '#f97316' : '#ef4444'
  const counts = Array.from({ length: 10 }, (_, i) => rated.filter(e => e.user_rating === i + 1).length)
  return (
    <div className="nf-site-rating-block">
      <div className="nf-site-rating-top">
        <div className="nf-site-rating-left">
          <span className="nf-site-rating-eyebrow">NICKFLIX RATING</span>
          <div className="nf-site-rating-score-row">
            <span className="nf-site-rating-number" style={{ color: scoreColor }}>{avg.toFixed(1)}</span>
            <span className="nf-site-rating-denom">/10</span>
          </div>
          <span className="nf-site-rating-voters">{rated.length} vote{rated.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="nf-site-rating-bars">
          {counts.map((c, i) => {
            const max = Math.max(...counts, 1)
            const h = Math.round((c / max) * 32)
            return (
              <div key={i} className="nf-site-rating-bar-col" title={`${i+1}/10 — ${c} vote${c !== 1 ? 's' : ''}`}>
                <div className="nf-site-rating-bar-fill" style={{ height: h || 2, background: i + 1 <= avg ? scoreColor : '#2a2a2a' }} />
                <span className="nf-site-rating-bar-label">{i + 1}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="nf-site-rating-track">
        <div className="nf-site-rating-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${scoreColor}88, ${scoreColor})` }} />
      </div>
    </div>
  )
}

// ─── COMMUNITY REVIEW CARD ────────────────────────────────────────────────────
function CommunityReviewCard({ entry, profileName, isCurrentUser }) {
  const accentColor = isCurrentUser ? '#3b82f6' : '#f5c518'
  return (
    <div className="nf-modal-review-card" style={{ borderColor: isCurrentUser ? '#3b82f622' : '#1e1e1e' }}>
      <div className="nf-modal-review-card-top" style={{ borderColor: accentColor + '33', background: accentColor + '08' }}>
        <div className="nf-modal-review-avatar" style={{ background: accentColor + '22', color: accentColor, border: `1px solid ${accentColor}44` }}>
          {profileName.charAt(0).toUpperCase()}
        </div>
        <span className="nf-modal-review-name" style={{ color: accentColor }}>{profileName}</span>
        {isCurrentUser && <span className="nf-modal-review-you">YOU</span>}
        <div style={{ flex: 1 }} />
        {entry.status === 'watched'   && <span className="nf-modal-review-status-watched">✓ Watched</span>}
        {entry.status === 'watchlist' && <span className="nf-modal-review-status-queue">+ Queued</span>}
        {entry.recommended            && <span className="nf-modal-review-rec">📣 Recommends</span>}
      </div>
      {(entry.user_rating || entry.comment) && (
        <div className="nf-modal-review-card-body">
          {entry.user_rating && (
            <div className="nf-modal-review-stars">
              {[1,2,3,4,5,6,7,8,9,10].map(i => (
                <span key={i} style={{ color: i <= entry.user_rating ? '#f5c518' : '#2a2a2a', fontSize: 13 }}>★</span>
              ))}
              <span className="nf-modal-review-score">{entry.user_rating}/10</span>
            </div>
          )}
          {entry.comment && <p className="nf-modal-review-text">"{entry.comment}"</p>}
        </div>
      )}
    </div>
  )
}

// ─── MOVIE MODAL ──────────────────────────────────────────────────────────────
function MovieModal({ movie, entry, userId, allEntries, profileNames, onClose, onSave }) {
  const [status, setStatus]           = useState(entry?.status || null)
  const [rating, setRating]           = useState(entry?.user_rating || 0)
  const [comment, setComment]         = useState(entry?.comment || '')
  const [recommended, setRecommended] = useState(entry?.recommended || false)
  const [saving, setSaving]           = useState(false)
  const [details, setDetails]         = useState(null)

  useEffect(() => { tmdb(`/movie/${movie.id}`, { append_to_response: 'videos,credits' }).then(setDetails) }, [movie.id])

  const trailer  = details?.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
  const director = details?.credits?.crew?.find(c => c.job === 'Director')
  const cast     = details?.credits?.cast?.slice(0, 5)
  const allReviews = (allEntries || []).filter(e => e.user_rating || e.comment || e.status)

  const save = async () => {
    if (!userId) return; setSaving(true)
    await supabase.from('watchlist').upsert({
      user_id: userId, tmdb_id: movie.id, title: movie.title,
      poster_path: movie.poster_path, status,
      user_rating: rating || null, comment: comment || null, recommended,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,tmdb_id' })
    setSaving(false); onSave(); onClose()
  }

  const remove = async () => {
    if (!entry) return
    await supabase.from('watchlist').delete().eq('user_id', userId).eq('tmdb_id', movie.id)
    onSave(); onClose()
  }

  return (
    <div className="nf-modal-overlay" onClick={onClose}>
      <div className="nf-modal" onClick={e => e.stopPropagation()}>
        {movie.backdrop_path && <div className="nf-modal-backdrop" style={{ backgroundImage: `url(${TMDB_IMG}/w1280${movie.backdrop_path})` }} />}
        <button className="nf-modal-close" onClick={onClose}>✕</button>
        <div className="nf-modal-body">
          <div className="nf-modal-left">
            {movie.poster_path && <img src={`${TMDB_IMG}/w342${movie.poster_path}`} alt={movie.title} className="nf-modal-poster" />}
            <div className="nf-modal-actions">
              <button className={`nf-action-btn ${status === 'watchlist' ? 'active-watch' : ''}`} onClick={() => setStatus(s => s === 'watchlist' ? null : 'watchlist')}>
                {status === 'watchlist' ? '✓ In Watchlist' : '+ Watchlist'}
              </button>
              <button className={`nf-action-btn ${status === 'watched' ? 'active-seen' : ''}`} onClick={() => setStatus(s => s === 'watched' ? null : 'watched')}>
                {status === 'watched' ? '✓ Watched' : 'Mark Watched'}
              </button>
              <button className={`nf-action-btn nf-recommend-btn ${recommended ? 'active-recommend' : ''}`} onClick={() => setRecommended(r => !r)}>
                {recommended ? '📣 Recommended' : '📣 Recommend'}
              </button>
            </div>
          </div>
          <div className="nf-modal-right">
            <h2 className="nf-modal-title">{movie.title}</h2>
            <div className="nf-modal-meta">
              <span>{movie.release_date?.slice(0,4)}</span>
              {details?.runtime && <span>{details.runtime} min</span>}
              {director && <span>Dir. {director.name}</span>}
              {movie.vote_average > 0 && <span>⭐ {movie.vote_average?.toFixed(1)} TMDB</span>}
            </div>
            {details?.genres && <div className="nf-modal-genres">{details.genres.map(g => <span key={g.id} className="nf-genre-tag">{g.name}</span>)}</div>}
            <p className="nf-modal-overview">{movie.overview}</p>
            {cast?.length > 0 && <div className="nf-modal-cast"><span className="nf-modal-label">Cast</span><span>{cast.map(c => c.name).join(', ')}</span></div>}
            {trailer && <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noreferrer" className="nf-trailer-btn">▶ Watch Trailer</a>}
            <SiteRatingBlock allEntries={allEntries} />
            <div className="nf-modal-divider" />
            <div className="nf-modal-section"><span className="nf-modal-label">Your Rating</span><StarRating value={rating} onChange={setRating} /></div>
            <div className="nf-modal-section">
              <span className="nf-modal-label">Your Review</span>
              <textarea className="nf-comment-input" placeholder="What did you think?" value={comment} onChange={e => setComment(e.target.value)} rows={3} />
            </div>
            <div className="nf-modal-footer">
              {entry && <button className="nf-remove-btn" onClick={remove}>Remove</button>}
              <button className="nf-save-btn" onClick={save} disabled={saving || !status}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
            {allReviews.length > 0 && (
              <>
                <div className="nf-modal-divider" />
                <div className="nf-modal-section">
                  <span className="nf-modal-label">Community ({allReviews.length})</span>
                  <div className="nf-modal-reviews-list">
                    {allReviews.map((r, i) => (
                      <CommunityReviewCard key={i} entry={r} profileName={profileNames[r.user_id] || 'Nicktopian'} isCurrentUser={r.user_id === userId} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MOVIE CARD ───────────────────────────────────────────────────────────────
function MovieCard({ movie, entry, communityEntries, onOpen }) {
  const poster = movie.poster_path ? `${TMDB_IMG}/w342${movie.poster_path}` : null
  const cardRef = useRef()
  const [faded, setFaded] = useState(false)
  useEffect(() => {
    const el = cardRef.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => setFaded(!e.isIntersecting), { threshold: 0 })
    obs.observe(el); return () => obs.disconnect()
  }, [])
  const ratedEntries = (communityEntries || []).filter(e => e.user_rating)
  const communityAvg = ratedEntries.length > 0 ? (ratedEntries.reduce((s,e) => s + e.user_rating, 0) / ratedEntries.length).toFixed(1) : null
  return (
    <div ref={cardRef} className={`nf-movie-card${faded ? ' nf-fade-out' : ''}`} onClick={() => onOpen(movie, entry)}>
      <div className="nf-movie-poster">
        {poster ? <img src={poster} alt={movie.title} loading="lazy" /> : <div className="nf-movie-no-poster">🎬</div>}
        {entry && <div className={`nf-movie-status-badge ${entry.status}`}>{entry.status === 'watched' ? '✓ Watched' : '+ Watchlist'}</div>}
        {entry?.user_rating && <div className="nf-movie-rating-badge">{entry.user_rating}/10</div>}
        {communityAvg && <div className="nf-movie-community-badge">★ {communityAvg} ({ratedEntries.length})</div>}
        <div className="nf-movie-overlay"><span className="nf-movie-overlay-text">View Details</span></div>
      </div>
      <div className="nf-movie-info">
        <span className="nf-movie-title">{movie.title}</span>
        <span className="nf-movie-year">{movie.release_date?.slice(0,4)}</span>
      </div>
    </div>
  )
}

// ─── ACTOR CARD ───────────────────────────────────────────────────────────────
function ActorCard({ actor, isFavourited, onToggleFavourite, onClick }) {
  const [photo, setPhoto] = useState(null)
  const [toggling, setToggling] = useState(false)
  useEffect(() => {
    tmdb('/search/person', { query: actor.name }).then(data => {
      const p = data.results?.[0]; if (p?.profile_path) setPhoto(`${TMDB_IMG}/w185${p.profile_path}`)
    })
  }, [actor.name])
  const handleFav = async (e) => {
    e.stopPropagation(); setToggling(true)
    await onToggleFavourite(actor.name); setToggling(false)
  }
  return (
    <div className="nf-actor-card" onClick={() => onClick(actor, photo)}>
      <div className="nf-actor-photo">
        {photo ? <img src={photo} alt={actor.name} loading="lazy" /> : <div className="nf-actor-no-photo">{actor.name.charAt(0)}</div>}
        <div className="nf-actor-tier-badge" style={{ background: TIER_COLORS[actor.tier] }}>{actor.tier === 'G' ? 'GOLD' : actor.tier}</div>
        <button className={`nf-actor-fav-btn ${isFavourited ? 'faved' : ''}`} onClick={handleFav} disabled={toggling} title={isFavourited ? 'Remove from favourites' : 'Add to favourites'}>
          {isFavourited ? '♥' : '♡'}
        </button>
      </div>
      <div className="nf-actor-info">
        <span className="nf-actor-name">{actor.name}</span>
        <span className="nf-actor-desc">{actor.desc}</span>
      </div>
    </div>
  )
}

function ActorModal({ actor, photo, userId, onClose }) {
  const [fullDetails, setFullDetails] = useState(null)
  const [comments, setComments]       = useState([])
  const [localProfileNames, setLocalProfileNames] = useState({})
  const [newComment, setNewComment]   = useState('')
  const [posting, setPosting]         = useState(false)

  useEffect(() => {
    tmdb('/search/person', { query: actor.name }).then(async data => {
      const person = data.results?.[0]
      if (person?.id) setFullDetails(await tmdb(`/person/${person.id}`, { append_to_response: 'movie_credits' }))
    })
    loadComments()
  }, [actor.name])

  const loadComments = async () => {
    const { data } = await supabase.from('actor_comments').select('*').eq('actor_name', actor.name).order('created_at', { ascending: false })
    if (!data) return
    setComments(data)
    const ids = [...new Set(data.map(c => c.user_id))]
    if (ids.length) {
      const { data: profiles } = await supabase.from('profiles').select('id, display_name').in('id', ids)
      if (profiles) { const m = {}; profiles.forEach(p => { m[p.id] = p.display_name || 'Nicktopian' }); setLocalProfileNames(m) }
    }
  }

  const postComment = async () => {
    if (!newComment.trim() || !userId) return
    setPosting(true)
    await supabase.from('actor_comments').insert({ user_id: userId, actor_name: actor.name, comment: newComment.trim() })
    setNewComment(''); await loadComments(); setPosting(false)
  }

  const deleteComment = async (id) => {
    await supabase.from('actor_comments').delete().eq('id', id)
    setComments(prev => prev.filter(c => c.id !== id))
  }

  const topMovies = fullDetails?.movie_credits?.cast?.sort((a,b) => (b.popularity||0)-(a.popularity||0))?.slice(0,8)

  return (
    <div className="nf-modal-overlay" onClick={onClose}>
      <div className="nf-actor-modal" onClick={e => e.stopPropagation()}>
        <button className="nf-modal-close" onClick={onClose}>✕</button>
        <div className="nf-actor-modal-body">
          <div className="nf-actor-modal-left">
            {photo ? <img src={photo} alt={actor.name} className="nf-actor-modal-photo" /> : <div className="nf-actor-modal-initial">{actor.name.charAt(0)}</div>}
            <div className="nf-actor-modal-tier" style={{ background: TIER_COLORS[actor.tier] }}>{TIER_LABELS[actor.tier]}</div>
            {fullDetails?.birthday && <div className="nf-actor-modal-bio"><span>Born {fullDetails.birthday}</span>{fullDetails.place_of_birth && <span>{fullDetails.place_of_birth}</span>}</div>}
          </div>
          <div className="nf-actor-modal-right">
            <h2 className="nf-actor-modal-name">{actor.name}</h2>
            <p className="nf-actor-modal-nick-desc">"{actor.desc}"</p>
            <div className="nf-actor-modal-films"><span className="nf-modal-label">Key Films</span><p>{actor.films}</p></div>
            {fullDetails?.biography && <div className="nf-actor-modal-biography"><span className="nf-modal-label">Biography</span><p>{fullDetails.biography.slice(0,500)}...</p></div>}
            {topMovies?.length > 0 && (
              <div className="nf-actor-modal-credits">
                <span className="nf-modal-label">Top TMDB Credits</span>
                <div className="nf-actor-credits-grid">
                  {topMovies.map(m => (
                    <div key={m.id} className="nf-actor-credit">
                      {m.poster_path ? <img src={`${TMDB_IMG}/w92${m.poster_path}`} alt={m.title} /> : <div className="nf-credit-no-img">🎬</div>}
                      <span>{m.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="nf-modal-divider" />
            <div className="nf-actor-comments-section">
              <span className="nf-modal-label">Community Comments ({comments.length})</span>
              {userId && (
                <div className="nf-actor-comment-form">
                  <textarea className="nf-comment-input" placeholder={`What do you think of ${actor.name}?`} value={newComment} onChange={e => setNewComment(e.target.value)} rows={2} />
                  <button className="nf-save-btn" onClick={postComment} disabled={posting || !newComment.trim()} style={{ alignSelf:'flex-end', marginTop:8 }}>{posting ? 'Posting...' : 'Post'}</button>
                </div>
              )}
              {comments.length === 0
                ? <div style={{ color:'#444', fontStyle:'italic', fontSize:'0.85rem', padding:'12px 0' }}>No comments yet. Be the first.</div>
                : <div className="nf-actor-comments-list">
                    {comments.map(c => (
                      <div key={c.id} className="nf-actor-comment">
                        <div className="nf-actor-comment-header">
                          <div className="nf-actor-comment-avatar" style={{ background: c.user_id === userId ? '#3b82f622' : '#f5c51822', color: c.user_id === userId ? '#3b82f6' : '#f5c518', border: `1px solid ${c.user_id === userId ? '#3b82f644' : '#f5c51844'}` }}>
                            {(localProfileNames[c.user_id] || 'N').charAt(0).toUpperCase()}
                          </div>
                          <span className="nf-actor-comment-name" style={{ color: c.user_id === userId ? '#3b82f6' : '#f5c518' }}>{localProfileNames[c.user_id] || 'Nicktopian'}</span>
                          {c.user_id === userId && <span className="nf-modal-review-you">YOU</span>}
                          <span className="nf-actor-comment-date">{new Date(c.created_at).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' })}</span>
                          {c.user_id === userId && <button className="nf-actor-comment-delete" onClick={() => deleteComment(c.id)}>✕</button>}
                        </div>
                        <p className="nf-actor-comment-text">"{c.comment}"</p>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SEARCH BAR ───────────────────────────────────────────────────────────────
function SearchBar({ onSelect }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef()
  const search = useCallback((q) => {
    clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const data = await tmdb('/search/movie', { query: q, language: 'en-US' })
      setResults(data.results?.slice(0,6) || []); setLoading(false)
    }, 400)
  }, [])
  return (
    <div className="nf-search-wrap">
      <input className="nf-search-input" placeholder="🔍  Search any movie..." value={query} onChange={e => { setQuery(e.target.value); search(e.target.value) }} />
      {loading && <div className="nf-search-loading">Searching...</div>}
      {results.length > 0 && (
        <div className="nf-search-results">
          {results.map(r => (
            <div key={r.id} className="nf-search-result" onClick={() => { onSelect(r); setQuery(''); setResults([]) }}>
              {r.poster_path ? <img src={`${TMDB_IMG}/w92${r.poster_path}`} alt={r.title} /> : <div className="nf-search-no-img">🎬</div>}
              <div><span className="nf-search-result-title">{r.title}</span><span className="nf-search-result-year">{r.release_date?.slice(0,4)}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── WATCHLIST CARD ───────────────────────────────────────────────────────────
function WatchlistCard({ entry, communityEntries, onOpen }) {
  const [movie, setMovie] = useState(null)
  useEffect(() => { tmdb(`/movie/${entry.tmdb_id}`).then(setMovie) }, [entry.tmdb_id])
  if (!movie) return <div className="nf-movie-card nf-skeleton" />
  const ratedEntries = (communityEntries || []).filter(e => e.user_rating)
  const communityAvg = ratedEntries.length > 0 ? (ratedEntries.reduce((s,e) => s + e.user_rating, 0) / ratedEntries.length).toFixed(1) : null
  return (
    <div className="nf-movie-card" onClick={() => onOpen(movie, entry)}>
      <div className="nf-movie-poster">
        {entry.poster_path ? <img src={`${TMDB_IMG}/w342${entry.poster_path}`} alt={entry.title} loading="lazy" /> : <div className="nf-movie-no-poster">🎬</div>}
        <div className={`nf-movie-status-badge ${entry.status}`}>{entry.status === 'watched' ? '✓ Watched' : '+ Watchlist'}</div>
        {entry.user_rating && <div className="nf-movie-rating-badge">{entry.user_rating}/10</div>}
        {communityAvg && <div className="nf-movie-community-badge">★ {communityAvg} ({ratedEntries.length})</div>}
        <div className="nf-movie-overlay"><span className="nf-movie-overlay-text">View Details</span></div>
      </div>
      <div className="nf-movie-info">
        <span className="nf-movie-title">{entry.title}</span>
        {entry.comment && <span className="nf-movie-comment">"{entry.comment}"</span>}
      </div>
    </div>
  )
}

// ─── ACTIVITY ROW ─────────────────────────────────────────────────────────────
function ActivityRow({ ev, profileName, isCurrentUser, compact = false }) {
  const color = TYPE_COLOR[ev.type] || '#888'
  const icon  = TYPE_ICON[ev.type]  || '●'
  const acc   = isCurrentUser ? '#3b82f6' : '#f5c518'
  const isActorEvent = ev.type === 'actor_fav' || ev.type === 'actor_comment'

  return (
    <div className={`nf-activity-row ${compact ? 'compact' : ''}`}>
      {/* poster / actor thumbnail */}
      <div className={`nf-activity-thumb ${isActorEvent ? 'actor' : ''}`}>
        {ev.posterPath
          ? <img
              src={isActorEvent ? ev.posterPath : `${TMDB_IMG}/w92${ev.posterPath}`}
              alt={isActorEvent ? ev.actorName : ev.movieTitle}
              style={isActorEvent ? { objectPosition: 'top' } : {}}
            />
          : <div className="nf-activity-thumb-placeholder" style={{ background: color + '22', color }}>{icon}</div>
        }
        <div className="nf-activity-type-dot" style={{ background: color }}>{icon}</div>
      </div>

      {/* text */}
      <div className="nf-activity-content">
        <div className="nf-activity-sentence">
          <span className="nf-activity-who" style={{ color: acc }}>{profileName}</span>
          {' '}
          <span className="nf-activity-action">{renderAction(ev)}</span>
        </div>
        {ev.type === 'reviewed' && ev.comment && (
          <p className="nf-activity-comment">"{ev.comment}"</p>
        )}
        {ev.type === 'actor_comment' && ev.comment && (
          <p className="nf-activity-comment">"{ev.comment}"</p>
        )}
        <span className="nf-activity-time">{timeAgo(ev.timestamp)}</span>
      </div>
    </div>
  )
}

function renderAction(ev) {
  switch (ev.type) {
    case 'watched':       return <>watched <em>{ev.movieTitle}</em></>
    case 'queued':        return <>added <em>{ev.movieTitle}</em> to watchlist</>
    case 'rated':         return <>rated <em>{ev.movieTitle}</em> <span style={{ color:'#f5c518', fontStyle:'normal' }}>★ {ev.rating}/10</span></>
    case 'reviewed':      return <>reviewed <em>{ev.movieTitle}</em></>
    case 'recommended':   return <>recommended <em>{ev.movieTitle}</em> <span style={{ fontStyle:'normal' }}>📣</span></>
    case 'actor_fav':     return <>favourited <span style={{ color:'#ec4899' }}>♥ {ev.actorName}</span></>
    case 'actor_comment': return <>commented on <span style={{ color:'#f5c518' }}>{ev.actorName}</span></>
    default:              return <>did something</>
  }
}

// ─── ACTOR PHOTO CACHE (module-level so it persists across renders) ────────────
const actorPhotoCache = {}
async function getActorPhoto(actorName) {
  if (actorPhotoCache[actorName] !== undefined) return actorPhotoCache[actorName]
  actorPhotoCache[actorName] = null // mark in-flight
  try {
    const data = await tmdb('/search/person', { query: actorName })
    const p = data.results?.[0]
    const url = p?.profile_path ? `${TMDB_IMG}/w185${p.profile_path}` : null
    actorPhotoCache[actorName] = url
    return url
  } catch { return null }
}

async function hydrateActorPhotos(events) {
  const actorEvents = events.filter(e => (e.type === 'actor_fav' || e.type === 'actor_comment') && !e.posterPath)
  const uniqueNames = [...new Set(actorEvents.map(e => e.actorName))]
  await Promise.all(uniqueNames.map(getActorPhoto))
  return events.map(e => {
    if ((e.type === 'actor_fav' || e.type === 'actor_comment') && !e.posterPath) {
      return { ...e, posterPath: actorPhotoCache[e.actorName] || null }
    }
    return e
  })
}

// ─── SITE ACTIVITY FEED ───────────────────────────────────────────────────────
function SiteActivityFeed({ profileNames, currentUserId }) {
  const [events, setEvents]     = useState([])
  const [newCount, setNewCount] = useState(0)
  const [loading, setLoading]   = useState(true)
  const eventsRef = useRef([])

  const buildEvents = useCallback((watchlistRows, actorFavRows, actorCommentRows) => {
    const all = []
    watchlistRows.forEach(row => all.push(...watchlistToEvents(row)))
    actorFavRows.forEach(row => all.push({ type: 'actor_fav', userId: row.user_id, timestamp: row.created_at, actorName: row.actor_name }))
    actorCommentRows.forEach(row => all.push({ type: 'actor_comment', userId: row.user_id, timestamp: row.created_at, actorName: row.actor_name, comment: row.comment }))
    return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50)
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [{ data: wl }, { data: af }, { data: ac }] = await Promise.all([
        supabase.from('watchlist').select('*').order('updated_at', { ascending: false }).limit(100),
        supabase.from('actor_favourites').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('actor_comments').select('*').order('created_at', { ascending: false }).limit(100),
      ])
      const built = buildEvents(wl || [], af || [], ac || [])
      const hydrated = await hydrateActorPhotos(built)
      eventsRef.current = hydrated
      setEvents(hydrated)
      setLoading(false)
    }
    load()

    // Realtime subscriptions — one channel per table
    const wlChannel = supabase.channel('site-activity-watchlist')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'watchlist' }, async () => {
        const { data } = await supabase.from('watchlist').select('*').order('updated_at', { ascending: false }).limit(100)
        const afData = eventsRef.current.filter(e => e.type === 'actor_fav').map(e => ({ user_id: e.userId, created_at: e.timestamp, actor_name: e.actorName }))
        const acData = eventsRef.current.filter(e => e.type === 'actor_comment').map(e => ({ user_id: e.userId, created_at: e.timestamp, actor_name: e.actorName, comment: e.comment }))
        const built = buildEvents(data || [], afData, acData)
        const hydrated = await hydrateActorPhotos(built)
        const prevTop = eventsRef.current[0]?.timestamp
        eventsRef.current = hydrated
        setEvents(hydrated)
        if (prevTop && hydrated[0]?.timestamp !== prevTop) setNewCount(n => n + 1)
      })
      .subscribe()

    const afChannel = supabase.channel('site-activity-actorfav')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actor_favourites' }, async (payload) => {
        const photo = await getActorPhoto(payload.new.actor_name)
        const newEv = { type: 'actor_fav', userId: payload.new.user_id, timestamp: payload.new.created_at, actorName: payload.new.actor_name, posterPath: photo }
        eventsRef.current = [newEv, ...eventsRef.current].slice(0, 50)
        setEvents([...eventsRef.current])
        setNewCount(n => n + 1)
      })
      .subscribe()

    const acChannel = supabase.channel('site-activity-actorcomment')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actor_comments' }, async (payload) => {
        const photo = await getActorPhoto(payload.new.actor_name)
        const newEv = { type: 'actor_comment', userId: payload.new.user_id, timestamp: payload.new.created_at, actorName: payload.new.actor_name, comment: payload.new.comment, posterPath: photo }
        eventsRef.current = [newEv, ...eventsRef.current].slice(0, 50)
        setEvents([...eventsRef.current])
        setNewCount(n => n + 1)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(wlChannel)
      supabase.removeChannel(afChannel)
      supabase.removeChannel(acChannel)
    }
  }, [buildEvents])

  if (loading) return (
    <div className="nf-site-feed-loading">
      <span className="nf-site-feed-pulse" />
      <span style={{ color: '#333', fontSize: '0.7rem', letterSpacing: 2, fontFamily: 'Courier New' }}>LOADING ACTIVITY...</span>
    </div>
  )

  if (events.length === 0) return (
    <div className="nf-site-feed-empty">No activity yet. Start watching some films!</div>
  )

  return (
    <div className="nf-site-feed">
      <div className="nf-site-feed-header">
        <div className="nf-site-feed-live">
          <span className="nf-site-feed-dot" />
          LIVE
        </div>
        <span className="nf-site-feed-title">SITE ACTIVITY</span>
        {newCount > 0 && (
          <span className="nf-site-feed-badge" onClick={() => setNewCount(0)}>{newCount} new</span>
        )}
      </div>
      <div className="nf-site-feed-list">
        {events.map((ev, i) => (
          <ActivityRow
            key={`${ev.userId}-${ev.type}-${ev.timestamp}`}
            ev={ev}
            profileName={profileNames[ev.userId] || 'Nicktopian'}
            isCurrentUser={ev.userId === currentUserId}
            compact
          />
        ))}
      </div>
    </div>
  )
}

// ─── PROFILE ACTIVITY TAB ─────────────────────────────────────────────────────
function ProfileActivityTab({ userId, profileName, watchlistEntries, actorFavs, actorComments, currentUserId }) {
  const [events, setEvents] = useState([])

  useEffect(() => {
    const raw = [
      ...watchlistEntries.flatMap(watchlistToEvents),
      ...actorFavs.map(f => ({ type: 'actor_fav', userId, timestamp: f.created_at, actorName: f.actor_name })),
      ...actorComments.map(c => ({ type: 'actor_comment', userId, timestamp: c.created_at, actorName: c.actor_name, comment: c.comment })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    hydrateActorPhotos(raw).then(setEvents)
  }, [userId, watchlistEntries, actorFavs, actorComments])

  if (events.length === 0) return <div className="nf-community-empty">No activity yet.</div>

  return (
    <div className="nf-profile-activity-list">
      {events.map((ev, i) => (
        <ActivityRow
          key={`${ev.type}-${ev.timestamp}-${i}`}
          ev={ev}
          profileName={profileName}
          isCurrentUser={userId === currentUserId}
        />
      ))}
    </div>
  )
}

// ─── COMMUNITY AVATAR ─────────────────────────────────────────────────────────
function CommunityAvatar({ avatarUrl, name, size = 48 }) {
  const initials = name ? name.charAt(0).toUpperCase() : '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      border: '2px solid #f5c51833', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#f5c518',
    }}>
      {avatarUrl ? <img src={avatarUrl} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials}
    </div>
  )
}

function CommunityActorCard({ actorName, photo, tier, onViewComments }) {
  const tierColor = TIER_COLORS[tier] || '#f5c518'
  return (
    <div className="nf-community-actor-card" onClick={() => onViewComments(actorName)}>
      <div className="nf-community-actor-photo">
        {photo ? <img src={photo} alt={actorName} /> : <div className="nf-community-actor-initial">{actorName.charAt(0)}</div>}
        {tier && <div className="nf-community-actor-tier" style={{ background: tierColor }}>{tier === 'G' ? 'GOLD' : tier}</div>}
      </div>
      <span className="nf-community-actor-name">{actorName}</span>
      <span className="nf-community-actor-hint">View comments →</span>
    </div>
  )
}

function ActorCommentsModal({ actorName, currentUserId, profileNames, onClose }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const actorData = ACTORS.find(a => a.name === actorName)
  const tierColor = TIER_COLORS[actorData?.tier] || '#f5c518'

  useEffect(() => { loadComments() }, [actorName])

  const loadComments = async () => {
    setLoading(true)
    const { data } = await supabase.from('actor_comments').select('*').eq('actor_name', actorName).order('created_at', { ascending: false })
    setComments(data || []); setLoading(false)
  }

  const postComment = async () => {
    if (!newComment.trim() || !currentUserId) return
    setPosting(true)
    await supabase.from('actor_comments').insert({ user_id: currentUserId, actor_name: actorName, comment: newComment.trim() })
    setNewComment(''); await loadComments(); setPosting(false)
  }

  const deleteComment = async (id) => {
    await supabase.from('actor_comments').delete().eq('id', id)
    setComments(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="nf-modal-overlay" onClick={onClose}>
      <div className="nf-actor-comments-modal" onClick={e => e.stopPropagation()}>
        <button className="nf-modal-close" onClick={onClose}>✕</button>
        <div className="nf-actor-comments-modal-header" style={{ borderColor: tierColor + '44' }}>
          <span className="nf-actor-comments-modal-name" style={{ color: tierColor }}>{actorName}</span>
          {actorData && <span className="nf-actor-comments-modal-tier" style={{ background: tierColor }}>{TIER_LABELS[actorData.tier]}</span>}
        </div>
        {actorData && <p className="nf-actor-comments-modal-desc">"{actorData.desc}"</p>}
        <div className="nf-modal-divider" />
        <span className="nf-modal-label">Comments ({comments.length})</span>
        {currentUserId && (
          <div className="nf-actor-comment-form" style={{ marginTop: 12 }}>
            <textarea className="nf-comment-input" placeholder={`Your thoughts on ${actorName}...`} value={newComment} onChange={e => setNewComment(e.target.value)} rows={2} />
            <button className="nf-save-btn" onClick={postComment} disabled={posting || !newComment.trim()} style={{ alignSelf:'flex-end', marginTop:8 }}>{posting ? 'Posting...' : 'Post'}</button>
          </div>
        )}
        {loading
          ? <div style={{ color:'#444', padding:'20px', textAlign:'center', fontFamily:'Courier New', fontSize:'0.7rem', letterSpacing:'2px' }}>LOADING...</div>
          : comments.length === 0
            ? <div style={{ color:'#444', fontStyle:'italic', fontSize:'0.9rem', padding:'16px 0' }}>No comments yet.</div>
            : <div className="nf-actor-comments-list" style={{ marginTop: 16 }}>
                {comments.map(c => (
                  <div key={c.id} className="nf-actor-comment">
                    <div className="nf-actor-comment-header">
                      <div className="nf-actor-comment-avatar" style={{ background: c.user_id === currentUserId ? '#3b82f622' : '#f5c51822', color: c.user_id === currentUserId ? '#3b82f6' : '#f5c518', border: `1px solid ${c.user_id === currentUserId ? '#3b82f644' : '#f5c51844'}` }}>
                        {(profileNames[c.user_id] || 'N').charAt(0).toUpperCase()}
                      </div>
                      <span className="nf-actor-comment-name" style={{ color: c.user_id === currentUserId ? '#3b82f6' : '#f5c518' }}>{profileNames[c.user_id] || 'Nicktopian'}</span>
                      {c.user_id === currentUserId && <span className="nf-modal-review-you">YOU</span>}
                      <span className="nf-actor-comment-date">{new Date(c.created_at).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' })}</span>
                      {c.user_id === currentUserId && <button className="nf-actor-comment-delete" onClick={() => deleteComment(c.id)}>✕</button>}
                    </div>
                    <p className="nf-actor-comment-text">"{c.comment}"</p>
                  </div>
                ))}
              </div>
        }
      </div>
    </div>
  )
}

// ─── PROFILE VIEW ─────────────────────────────────────────────────────────────
function ProfileView({ profile, currentUserId, onBack, onOpenMovie, profileNames }) {
  const [tab, setTab]           = useState('watched')
  const [entries, setEntries]   = useState([])
  const [actorFavs, setActorFavs] = useState([])
  const [actorComments, setActorComments] = useState([])
  const [actorPhotos, setActorPhotos] = useState({})
  const [loading, setLoading]   = useState(true)
  const [fetching, setFetching] = useState(null)
  const [actorCommentsTarget, setActorCommentsTarget] = useState(null)

  const isOwn = profile.id === currentUserId
  const accentColor = isOwn ? '#3b82f6' : '#f5c518'
  const name = profile.display_name || 'Nicktopian'

  useEffect(() => {
    setLoading(true)
    Promise.all([
      supabase.from('watchlist').select('*').eq('user_id', profile.id).order('updated_at', { ascending: false }),
      supabase.from('actor_favourites').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('actor_comments').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
    ]).then(([{ data: wl }, { data: af }, { data: ac }]) => {
      setEntries(wl || [])
      const favList = af || []
      setActorFavs(favList)
      setActorComments(ac || [])
      favList.forEach(fav => {
        tmdb('/search/person', { query: fav.actor_name }).then(data => {
          const p = data.results?.[0]
          if (p?.profile_path) setActorPhotos(prev => ({ ...prev, [fav.actor_name]: `${TMDB_IMG}/w185${p.profile_path}` }))
        })
      })
      setLoading(false)
    })
  }, [profile.id])

  const watched     = entries.filter(e => e.status === 'watched')
  const watchlist   = entries.filter(e => e.status === 'watchlist')
  const reviews     = entries.filter(e => e.comment)
  const recommended = entries.filter(e => e.recommended)

  const tabs = [
    { id: 'watched',     label: 'WATCHED',   count: watched.length },
    { id: 'watchlist',   label: 'WATCHLIST', count: watchlist.length },
    { id: 'reviews',     label: 'REVIEWS',   count: reviews.length },
    { id: 'recommended', label: 'RECS',      count: recommended.length },
    { id: 'actors',      label: 'ACTORS',    count: actorFavs.length },
    { id: 'activity',    label: 'ACTIVITY' },
  ]

  const handlePosterClick = async (entry) => {
    setFetching(entry.tmdb_id)
    const data = await tmdb(`/movie/${entry.tmdb_id}`)
    setFetching(null)
    if (data?.id) onOpenMovie(data, null)
  }

  const PosterGrid = ({ items, showQueued }) => (
    items.length === 0
      ? <div className="nf-community-empty">{showQueued ? 'Nothing queued yet.' : 'No films here yet.'}</div>
      : <div className="nf-community-poster-grid">
          {items.map(e => (
            <div key={e.id} className="nf-community-poster-item" onClick={() => handlePosterClick(e)}>
              <div className="nf-community-poster-wrap"
                onMouseEnter={el => el.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={el => el.currentTarget.style.transform = ''}>
                {fetching === e.tmdb_id && (
                  <div style={{ position:'absolute', inset:0, background:'#000000aa', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2, borderRadius:8 }}>
                    <span style={{ color:'#f5c518', fontSize:20 }}>⏳</span>
                  </div>
                )}
                {e.poster_path ? <img src={`${TMDB_IMG}/w185${e.poster_path}`} alt={e.title} /> : <div className="nf-community-poster-fallback">🎬</div>}
                {e.user_rating && <div className="nf-community-poster-rating">★ {e.user_rating}</div>}
                {showQueued && <div className="nf-community-poster-queued">+ LIST</div>}
                {e.recommended && !showQueued && <div className="nf-community-poster-rec-badge">📣</div>}
              </div>
              <span className="nf-community-poster-title">{e.title}</span>
            </div>
          ))}
        </div>
  )

  return (
    <div className="nf-community-profile">
      <button className="nf-community-back" onClick={onBack}>← Community</button>
      <div className="nf-profile-hero" style={{ borderColor: accentColor + '33', background: `linear-gradient(135deg, ${accentColor}0d, transparent)` }}>
        <div className="nf-profile-hero-glow" style={{ background: `radial-gradient(ellipse at top right, ${accentColor}0a, transparent 65%)` }} />
        <div className="nf-profile-hero-inner">
          <CommunityAvatar avatarUrl={profile.avatar_url} name={name} size={96} />
          <div className="nf-profile-hero-info">
            <div className="nf-profile-name-row">
              <span className="nf-profile-name">{name}</span>
              {isOwn && <span className="nf-profile-you-badge">YOU</span>}
            </div>
            <div className="nf-profile-stats">
              <div className="nf-profile-stat"><span style={{ color: accentColor }}>{watched.length}</span><span>watched</span></div>
              <div className="nf-profile-stat"><span style={{ color: '#888' }}>{watchlist.length}</span><span>queued</span></div>
              <div className="nf-profile-stat"><span style={{ color: '#8b5cf6' }}>{reviews.length}</span><span>reviews</span></div>
              <div className="nf-profile-stat"><span style={{ color: '#f97316' }}>{recommended.length}</span><span>recs</span></div>
              <div className="nf-profile-stat"><span style={{ color: '#ec4899' }}>{actorFavs.length}</span><span>fav actors</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="nf-profile-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`nf-profile-tab ${tab === t.id ? 'active' : ''}`}
            style={tab === t.id ? { color: accentColor, borderColor: accentColor + '55', background: accentColor + '15' } : {}}
            onClick={() => setTab(t.id)}>
            {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
          </button>
        ))}
      </div>

      {loading && <div className="nf-community-loading">LOADING...</div>}

      {!loading && tab === 'watched'     && <PosterGrid items={watched} />}
      {!loading && tab === 'watchlist'   && <PosterGrid items={watchlist} showQueued />}
      {!loading && tab === 'recommended' && (
        recommended.length === 0
          ? <div className="nf-community-empty">No recommendations yet.</div>
          : <PosterGrid items={recommended} />
      )}

      {!loading && tab === 'reviews' && (
        reviews.length === 0
          ? <div className="nf-community-empty">No reviews written yet.</div>
          : <div className="nf-community-reviews-list">
              {reviews.map(e => (
                <div key={e.id} className="nf-community-review-card" onClick={() => handlePosterClick(e)}>
                  <div className="nf-community-review-poster">
                    {e.poster_path ? <img src={`${TMDB_IMG}/w92${e.poster_path}`} alt={e.title} /> : <div className="nf-community-poster-fallback">🎬</div>}
                  </div>
                  <div className="nf-community-review-body">
                    <div className="nf-community-review-top">
                      <span className="nf-community-review-title">{e.title}</span>
                      {e.user_rating && <span className="nf-community-review-rating">★ {e.user_rating}/10</span>}
                      <span className="nf-community-review-date">{new Date(e.updated_at).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' })}</span>
                    </div>
                    <p className="nf-community-review-text">"{e.comment}"</p>
                  </div>
                </div>
              ))}
            </div>
      )}

      {!loading && tab === 'actors' && (
        actorFavs.length === 0
          ? <div className="nf-community-empty">No favourite actors yet. Head to the Actors tab and click ♡ to add some.</div>
          : <div className="nf-community-actors-grid">
              {actorFavs.map(fav => {
                const actorData = ACTORS.find(a => a.name === fav.actor_name)
                return (
                  <CommunityActorCard key={fav.actor_name} actorName={fav.actor_name} photo={actorPhotos[fav.actor_name]} tier={actorData?.tier} onViewComments={name => setActorCommentsTarget(name)} />
                )
              })}
            </div>
      )}

      {!loading && tab === 'activity' && (
        <ProfileActivityTab
          userId={profile.id}
          profileName={name}
          watchlistEntries={entries}
          actorFavs={actorFavs}
          actorComments={actorComments}
          currentUserId={currentUserId}
        />
      )}

      {actorCommentsTarget && (
        <ActorCommentsModal actorName={actorCommentsTarget} currentUserId={currentUserId} profileNames={profileNames} onClose={() => setActorCommentsTarget(null)} />
      )}
    </div>
  )
}

// ─── COMMUNITY TAB ────────────────────────────────────────────────────────────
function CommunityTab({ currentUserId, allWatchlist, onOpenMovie, profileNames }) {
  const [profiles, setProfiles]       = useState([])
  const [entryCounts, setEntryCounts] = useState({})
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('profiles').select('id, display_name, avatar_url')
      if (error || !data) { setLoading(false); return }
      setProfiles([...data.filter(p => p.id === currentUserId), ...data.filter(p => p.id !== currentUserId)])
      const counts = {}
      allWatchlist.forEach(e => {
        if (!counts[e.user_id]) counts[e.user_id] = { watched:0, watchlist:0, reviews:0, recommended:0 }
        if (e.status === 'watched')   counts[e.user_id].watched++
        if (e.status === 'watchlist') counts[e.user_id].watchlist++
        if (e.comment)                counts[e.user_id].reviews++
        if (e.recommended)            counts[e.user_id].recommended++
      })
      setEntryCounts(counts); setLoading(false)
    }
    load()
  }, [currentUserId, allWatchlist])

  if (loading) return <div className="nf-community-loading">LOADING COMMUNITY...</div>

  if (selectedProfile) return (
    <ProfileView profile={selectedProfile} currentUserId={currentUserId} onBack={() => setSelectedProfile(null)} onOpenMovie={onOpenMovie} profileNames={profileNames} />
  )

  return (
    <div className="nf-community-view">
      {/* Split layout: members left, activity feed right */}
      <div className="nf-community-layout">
        {/* LEFT — members */}
        <div className="nf-community-left-col">
          <div className="nf-community-header">
            <h2 className="nf-community-title">COMMUNITY</h2>
            <span className="nf-community-count">{profiles.length} NICKTOPIAN{profiles.length !== 1 ? 'S' : ''}</span>
          </div>
          <div className="nf-community-list">
            {profiles.map(profile => {
              const counts = entryCounts[profile.id] || { watched:0, watchlist:0, reviews:0, recommended:0 }
              const isOwn = profile.id === currentUserId
              const accentColor = isOwn ? '#3b82f6' : '#f5c518'
              const name = profile.display_name || 'Nicktopian'
              return (
                <div key={profile.id} className="nf-community-card" style={{ borderColor: isOwn ? '#3b82f622' : '#1a1a1a' }} onClick={() => setSelectedProfile(profile)}>
                  <div className="nf-community-card-accent" style={{ background: `linear-gradient(90deg, ${accentColor}44, transparent)` }} />
                  <div className="nf-community-card-inner">
                    <CommunityAvatar avatarUrl={profile.avatar_url} name={name} size={64} />
                    <div className="nf-community-card-info">
                      <div className="nf-community-card-name-row">
                        <span className="nf-community-card-name">{name}</span>
                        {isOwn && <span className="nf-community-you">YOU</span>}
                      </div>
                      <div className="nf-community-card-stats">
                        <span style={{ color: accentColor }}>{counts.watched}<span className="nf-community-stat-label"> watched</span></span>
                        <span style={{ color: '#666' }}>{counts.watchlist}<span className="nf-community-stat-label"> queued</span></span>
                        <span style={{ color: '#8b5cf6' }}>{counts.reviews}<span className="nf-community-stat-label"> reviews</span></span>
                        <span style={{ color: '#f97316' }}>{counts.recommended}<span className="nf-community-stat-label"> recs</span></span>
                      </div>
                    </div>
                    <span className="nf-community-card-arrow">›</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT — live activity */}
        <div className="nf-community-right-col">
          <SiteActivityFeed profileNames={profileNames} currentUserId={currentUserId} />
        </div>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Nickflix({ user, onNavigate }) {
  const [view, setView]                 = useState('movies')
  const [activeGenre, setActiveGenre]   = useState('Crime')
  const [movies, setMovies]             = useState([])
  const [watchlist, setWatchlistData]   = useState([])
  const [allWatchlist, setAllWatchlist] = useState([])
  const [profileNames, setProfileNames] = useState({})
  const [favouriteActors, setFavouriteActors] = useState(new Set())
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [selectedMovieEntry, setSelectedMovieEntry] = useState(null)
  const [selectedActor, setSelectedActor] = useState(null)
  const [selectedActorPhoto, setSelectedActorPhoto] = useState(null)
  const [loading, setLoading]           = useState(false)
  const [activeTier, setActiveTier]     = useState('All')

  const loadWatchlist      = useCallback(async () => { if (!user?.id) return; const { data } = await supabase.from('watchlist').select('*').eq('user_id', user.id); setWatchlistData(data || []) }, [user?.id])
  const loadAllWatchlist   = useCallback(async () => { const { data } = await supabase.from('watchlist').select('*'); setAllWatchlist(data || []) }, [])
  const loadProfileNames   = useCallback(async () => { const { data } = await supabase.from('profiles').select('id, display_name'); if (data) { const m = {}; data.forEach(p => { m[p.id] = p.display_name || 'Nicktopian' }); setProfileNames(m) } }, [])
  const loadFavouriteActors = useCallback(async () => {
    if (!user?.id) return
    const { data } = await supabase.from('actor_favourites').select('actor_name').eq('user_id', user.id)
    if (data) setFavouriteActors(new Set(data.map(r => r.actor_name)))
  }, [user?.id])

  useEffect(() => { loadWatchlist(); loadAllWatchlist(); loadProfileNames(); loadFavouriteActors() }, [loadWatchlist, loadAllWatchlist, loadProfileNames, loadFavouriteActors])

  const toggleFavouriteActor = async (actorName) => {
    if (!user?.id) return
    if (favouriteActors.has(actorName)) {
      await supabase.from('actor_favourites').delete().eq('user_id', user.id).eq('actor_name', actorName)
      setFavouriteActors(prev => { const n = new Set(prev); n.delete(actorName); return n })
    } else {
      await supabase.from('actor_favourites').insert({ user_id: user.id, actor_name: actorName })
      setFavouriteActors(prev => new Set([...prev, actorName]))
    }
  }

  const fetchMovies = useCallback(async (genre) => {
    setLoading(true); setMovies([])
    const filmList = genre === 'All' ? buildAll() : MASTER_LIST[genre] || []
    for (let i = 0; i < filmList.length; i += 8) {
      const results = await Promise.all(filmList.slice(i, i+8).map(searchMovie))
      setMovies(prev => { const seen = new Set(prev.map(m => m.id)); return [...prev, ...results.filter(r => r && !seen.has(r.id))] })
    }
    setLoading(false)
  }, [])

  useEffect(() => { if (view === 'movies') fetchMovies(activeGenre) }, [activeGenre, view])

  const watchlistMap = {}; watchlist.forEach(w => { watchlistMap[w.tmdb_id] = w })
  const allEntriesMap = {}; allWatchlist.forEach(w => { if (!allEntriesMap[w.tmdb_id]) allEntriesMap[w.tmdb_id] = []; allEntriesMap[w.tmdb_id].push(w) })

  const openMovie = (movie, entry) => { setSelectedMovie(movie); setSelectedMovieEntry(entry || watchlistMap[movie.id] || null) }
  const filteredActors = activeTier === 'All' ? ACTORS : ACTORS.filter(a => a.tier === activeTier)
  const watchedMovies  = watchlist.filter(w => w.status === 'watched')
  const toWatchMovies  = watchlist.filter(w => w.status === 'watchlist')
  const handleSave = () => { loadWatchlist(); loadAllWatchlist() }

  return (
    <div className="nickflix">
      <div className="nf-cinema-header">
        <div className="nf-curtain nf-curtain-left" /><div className="nf-curtain nf-curtain-right" />
        <div className="nf-spotlight nf-spotlight-left" /><div className="nf-spotlight nf-spotlight-right" />
        <div className="nf-header-content"><h1 className="nf-title">NICKFLIX</h1><p className="nf-subtitle">Nick's Personal Cinema</p></div>
      </div>
      <div className="nf-nav">
        <div className="nf-nav-inner">
          {[
            { id: 'movies',    label: '🎬 Browse' },
            { id: 'actors',    label: `⭐ Actors${favouriteActors.size > 0 ? ` (♥ ${favouriteActors.size})` : ''}` },
            { id: 'watchlist', label: `📋 My List (${watchlist.length})` },
            { id: 'community', label: '👥 Community' },
          ].map(tab => (
            <button key={tab.id} className={`nf-nav-btn ${view === tab.id ? 'active' : ''}`} onClick={() => setView(tab.id)}>{tab.label}</button>
          ))}
          <div className="nf-nav-search"><SearchBar onSelect={m => { setView('movies'); openMovie(m, null) }} /></div>
        </div>
      </div>

      {view === 'movies' && (
        <div className="nf-movies-view">
          <div className="nf-genre-bar-wrap"><div className="nf-genre-bar">
            {GENRES.map(g => <button key={g} className={`nf-genre-btn ${activeGenre === g ? 'active' : ''}`} onClick={() => setActiveGenre(g)}>{g}</button>)}
          </div></div>
          {loading && movies.length === 0
            ? <div className="nf-loading"><div className="nf-film-reel">🎞️</div><p>Loading films...</p></div>
            : <>{loading && <div className="nf-loading-bar"><div className="nf-loading-bar-inner" /></div>}
                <div className="nf-movies-grid">{movies.map(movie => <MovieCard key={movie.id} movie={movie} entry={watchlistMap[movie.id]} communityEntries={allEntriesMap[movie.id]} onOpen={openMovie} />)}</div></>
          }
        </div>
      )}

      {view === 'actors' && (
        <div className="nf-actors-view">
          <div className="nf-tier-filter">
            {['All','S','A','B','G'].map(t => (
              <button key={t} className={`nf-tier-btn ${activeTier === t ? 'active' : ''}`}
                style={activeTier === t && t !== 'All' ? { background: TIER_COLORS[t] } : {}}
                onClick={() => setActiveTier(t)}>
                {t === 'All' ? 'All Tiers' : t === 'G' ? 'Golden Age' : `${t} Tier`}
              </button>
            ))}
          </div>
          {['S','A','B','G'].map(tier => {
            const actors = filteredActors.filter(a => a.tier === tier)
            if (!actors.length) return null
            return (
              <div key={tier} className="nf-tier-section">
                <div className="nf-tier-header">
                  <div className="nf-tier-line" style={{ background: TIER_COLORS[tier] }} />
                  <h2 className="nf-tier-title" style={{ color: TIER_COLORS[tier] }}>{TIER_LABELS[tier]}</h2>
                  <div className="nf-tier-line" style={{ background: TIER_COLORS[tier] }} />
                </div>
                <div className="nf-actors-grid">
                  {actors.map(actor => (
                    <ActorCard key={actor.name} actor={actor} isFavourited={favouriteActors.has(actor.name)} onToggleFavourite={toggleFavouriteActor} onClick={(a,p) => { setSelectedActor(a); setSelectedActorPhoto(p) }} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'watchlist' && (
        <div className="nf-watchlist-view">
          {watchlist.length === 0
            ? <div className="nf-empty"><div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🎬</div><p>Your list is empty.</p><button className="nf-save-btn" onClick={() => setView('movies')} style={{ marginTop:'1rem' }}>Browse Films</button></div>
            : <>
                {toWatchMovies.length > 0 && <div className="nf-watchlist-section"><h2 className="nf-watchlist-title">📋 To Watch ({toWatchMovies.length})</h2><div className="nf-watchlist-grid">{toWatchMovies.map(w => <WatchlistCard key={w.id} entry={w} communityEntries={allEntriesMap[w.tmdb_id]} onOpen={openMovie} />)}</div></div>}
                {watchedMovies.length > 0 && <div className="nf-watchlist-section"><h2 className="nf-watchlist-title">✓ Watched ({watchedMovies.length})</h2><div className="nf-watchlist-grid">{watchedMovies.map(w => <WatchlistCard key={w.id} entry={w} communityEntries={allEntriesMap[w.tmdb_id]} onOpen={openMovie} />)}</div></div>}
              </>
          }
        </div>
      )}

      {view === 'community' && <CommunityTab currentUserId={user?.id} allWatchlist={allWatchlist} onOpenMovie={openMovie} profileNames={profileNames} />}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} entry={selectedMovieEntry} userId={user?.id} allEntries={allEntriesMap[selectedMovie.id]} profileNames={profileNames} onClose={() => { setSelectedMovie(null); setSelectedMovieEntry(null) }} onSave={handleSave} />
      )}
      {selectedActor && (
        <ActorModal actor={selectedActor} photo={selectedActorPhoto} userId={user?.id} onClose={() => { setSelectedActor(null); setSelectedActorPhoto(null) }} />
      )}
    </div>
  )
}