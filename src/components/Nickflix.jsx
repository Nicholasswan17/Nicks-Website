import './Nickflix.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../supabase'

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG = 'https://image.tmdb.org/t/p'

const tmdb = async (path, params = {}) => {
  const url = new URL(`${TMDB_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TMDB_TOKEN}`, 'Content-Type': 'application/json' }
  })
  return res.json()
}

const MASTER_LIST = {
  'Crime': [
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather Part II', year: 1974 },
    { title: 'Goodfellas', year: 1990 },
    { title: 'Scarface', year: 1983 },
    { title: 'Casino', year: 1995 },
    { title: 'Heat', year: 1995 },
    { title: 'L.A. Confidential', year: 1997 },
    { title: 'Training Day', year: 2001 },
    { title: 'American Gangster', year: 2007 },
    { title: 'City of God', year: 2002 },
    { title: 'The Town', year: 2010 },
    { title: 'American History X', year: 1998 },
    { title: 'American Psycho', year: 2000 },
    { title: 'A Bronx Tale', year: 1993 },
    { title: 'Killing Them Softly', year: 2012 },
    { title: 'Fargo', year: 1996 },
    { title: 'The Boondock Saints', year: 1999 },
    { title: 'The French Connection', year: 1971 },
    { title: 'Once Upon a Time in America', year: 1984 },
    { title: 'Cop Land', year: 1997 },
    { title: 'The Accountant', year: 2016 },
    { title: 'Leon: The Professional', year: 1994 },
    { title: 'Falling Down', year: 1993 },
    { title: 'Lawless', year: 2012 },
    { title: 'Manhunter', year: 1986 },
    { title: "Carlito's Way", year: 1993 },
    { title: 'Serpico', year: 1973 },
    { title: 'Dog Day Afternoon', year: 1975 },
    { title: 'Donnie Brasco', year: 1997 },
    { title: 'Scent of a Woman', year: 1992 },
    { title: "The Devil's Advocate", year: 1997 },
    { title: 'Taxi Driver', year: 1976 },
    { title: 'Mean Streets', year: 1973 },
    { title: 'Cape Fear', year: 1991 },
    { title: 'The Irishman', year: 2019 },
    { title: 'Midnight Run', year: 1988 },
    { title: 'Road to Perdition', year: 2002 },
    { title: 'Zodiac', year: 2007 },
    { title: 'Kiss Kiss Bang Bang', year: 2005 },
    { title: 'The Talented Mr. Ripley', year: 1999 },
    { title: 'The Drop', year: 2014 },
    { title: 'Man on Fire', year: 2004 },
    { title: 'Inside Man', year: 2006 },
    { title: 'Glory', year: 1989 },
    { title: 'Malcolm X', year: 1992 },
    { title: 'Se7en', year: 1995, tmdbId: 807 },
    { title: 'A Beautiful Mind', year: 2001 },
    { title: 'Catch Me If You Can', year: 2002 },
  ],
  'Thriller': [
    { title: 'Mystic River', year: 2003 },
    { title: 'Chinatown', year: 1974 },
    { title: 'The Silence of the Lambs', year: 1991 },
    { title: 'The Usual Suspects', year: 1995 },
    { title: 'Twelve Monkeys', year: 1995 },
    { title: 'Primal Fear', year: 1996 },
    { title: 'The Game', year: 1997 },
    { title: 'Memento', year: 2000 },
    { title: 'Fallen', year: 1998 },
    { title: 'Donnie Darko', year: 2001 },
    { title: 'Oldboy', year: 2003, tmdbId: 670 },
    { title: 'Collateral', year: 2004 },
    { title: 'V for Vendetta', year: 2005 },
    { title: 'The Prestige', year: 2006 },
    { title: 'The Departed', year: 2006 },
    { title: 'Taken', year: 2008 },
    { title: 'Prisoners', year: 2013 },
    { title: 'Gone Girl', year: 2014 },
    { title: 'Parasite', year: 2019, tmdbId: 496243 },
    { title: 'Insomnia', year: 2002 },
    { title: 'Mississippi Burning', year: 1988 },
    { title: 'Enemy of the State', year: 1998 },
    { title: 'Night Moves', year: 1975 },
    { title: 'The Conversation', year: 1974 },
    { title: 'Marathon Man', year: 1976 },
    { title: "All the President's Men", year: 1976 },
    { title: 'Straw Dogs', year: 1971 },
    { title: '21 Grams', year: 2003 },
    { title: "Before the Devil Knows You're Dead", year: 2007 },
    { title: 'The Ides of March', year: 2011 },
    { title: 'Crimson Tide', year: 1995 },
    { title: 'The Pelican Brief', year: 1993 },
    { title: 'Flight', year: 2012 },
    { title: 'Swimming with Sharks', year: 1994 },
    { title: 'The Negotiator', year: 1998 },
    { title: 'The Insider', year: 1999 },
    { title: 'No Country for Old Men', year: 2007 },
    { title: 'The Fugitive', year: 1993 },
    { title: 'JFK', year: 1991 },
    { title: 'Men in Black', year: 1997 },
    { title: 'King of New York', year: 1990 },
  ],
  'Drama': [
    { title: 'Sleepers', year: 1996 },
    { title: 'Stand by Me', year: 1986 },
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Outsiders', year: 1983 },
    { title: 'The Patriot', year: 2000 },
    { title: 'American Beauty', year: 1999 },
    { title: 'American Graffiti', year: 1973 },
    { title: 'Papillon', year: 1973 },
    { title: 'Life is Beautiful', year: 1997 },
    { title: 'Good Will Hunting', year: 1997 },
    { title: 'Dead Poets Society', year: 1989 },
    { title: 'The Fisher King', year: 1991 },
    { title: 'Awakenings', year: 1990 },
    { title: 'Dead Man Walking', year: 1995 },
    { title: 'Milk', year: 2008 },
    { title: 'Philadelphia', year: 1993 },
    { title: 'Forrest Gump', year: 1994 },
    { title: 'Cast Away', year: 2000 },
    { title: 'The Green Mile', year: 1999 },
    { title: 'Rounders', year: 1998 },
    { title: 'The Martian', year: 2015 },
    { title: 'Capote', year: 2005 },
    { title: 'Doubt', year: 2008 },
    { title: 'The Master', year: 2012 },
    { title: 'Magnolia', year: 1999 },
    { title: "Charlie Wilson's War", year: 2007 },
    { title: 'Midnight Cowboy', year: 1969 },
    { title: 'Kramer vs. Kramer', year: 1979 },
    { title: 'Rain Man', year: 1988 },
    { title: 'Tootsie', year: 1982 },
    { title: 'Oppenheimer', year: 2023 },
    { title: 'Fences', year: 2016 },
    { title: 'The Hurricane', year: 1999 },
    { title: 'The Bucket List', year: 2007 },
    { title: 'Fast Times at Ridgemont High', year: 1982 },
    { title: 'Cinderella Man', year: 2005 },
    { title: 'Master and Commander', year: 2003 },
    { title: 'The Apostle', year: 1997 },
    { title: 'Tender Mercies', year: 1983 },
    { title: 'To Kill a Mockingbird', year: 1962 },
    { title: 'MASH', year: 1970 },
    { title: 'The Great Santini', year: 1979 },
  ],
  'Comedy': [
    { title: 'Blazing Saddles', year: 1974 },
    { title: 'Caddyshack', year: 1980 },
    { title: 'The Blues Brothers', year: 1980 },
    { title: 'Office Space', year: 1999 },
    { title: 'Dumb and Dumber', year: 1994 },
    { title: 'Happy Gilmore', year: 1996 },
    { title: 'Blades of Glory', year: 2007 },
    { title: 'Grown Ups', year: 2010 },
    { title: 'The Big Lebowski', year: 1998 },
    { title: 'Kingpin', year: 1996 },
    { title: 'Step Brothers', year: 2008 },
    { title: 'Talladega Nights', year: 2006 },
    { title: 'Meet the Parents', year: 2000 },
    { title: 'Analyze This', year: 1999 },
    { title: 'Analyze That', year: 2002 },
    { title: 'Ace Ventura: Pet Detective', year: 1994 },
    { title: 'Lock, Stock and Two Smoking Barrels', year: 1998 },
    { title: 'Snatch', year: 2000 },
    { title: 'Trading Places', year: 1983 },
    { title: 'Ghostbusters', year: 1984 },
    { title: 'Coming to America', year: 1988 },
    { title: 'Napoleon Dynamite', year: 2004 },
    { title: 'Groundhog Day', year: 1993 },
    { title: 'Harold & Kumar Go to White Castle', year: 2004 },
    { title: "Brewster's Millions", year: 1985 },
    { title: 'The Nutty Professor', year: 1996 },
    { title: 'Mrs. Doubtfire', year: 1993 },
    { title: 'Good Morning, Vietnam', year: 1987 },
    { title: 'Beverly Hills Cop', year: 1984 },
    { title: 'School of Rock', year: 2003 },
    { title: 'Night at the Museum', year: 2006 },
    { title: 'Tropic Thunder', year: 2008 },
    { title: "Ferris Bueller's Day Off", year: 1986 },
    { title: 'Back to the Future', year: 1985 },
    { title: 'Billy Madison', year: 1995 },
    { title: 'The Waterboy', year: 1998 },
    { title: 'The Wedding Singer', year: 1998 },
    { title: 'Big Daddy', year: 1999 },
    { title: '50 First Dates', year: 2004 },
    { title: 'Click', year: 2006 },
    { title: 'Anger Management', year: 2003 },
    { title: 'Uncut Gems', year: 2019 },
    { title: 'Zoolander', year: 2001 },
    { title: "There's Something About Mary", year: 1998 },
    { title: 'Heavyweights', year: 1995 },
    { title: 'Along Came Polly', year: 2004 },
    { title: 'Elf', year: 2003 },
    { title: 'Anchorman: The Legend of Ron Burgundy', year: 2004 },
    { title: 'Old School', year: 2003 },
    { title: 'The Other Guys', year: 2010 },
    { title: 'Stranger Than Fiction', year: 2006 },
    { title: 'Pineapple Express', year: 2008 },
    { title: 'This Is the End', year: 2013 },
    { title: 'Lost in Translation', year: 2003 },
    { title: 'Stripes', year: 1981 },
    { title: 'Rushmore', year: 1998 },
    { title: 'What About Bob?', year: 1991 },
    { title: 'The Jerk', year: 1979 },
    { title: 'Planes, Trains and Automobiles', year: 1987 },
    { title: 'Home Alone', year: 1990 },
    { title: 'My Cousin Vinny', year: 1992 },
  ],
  'Horror': [
    { title: 'Halloween', year: 1978 },
    { title: 'The Shining', year: 1980 },
    { title: 'The Exorcist', year: 1973 },
    { title: 'Jaws', year: 1975 },
    { title: 'The Thing', year: 1982 },
    { title: 'Aliens', year: 1986 },
    { title: 'Carrie', year: 1976 },
    { title: 'Scream', year: 1996 },
    { title: 'Get Out', year: 2017 },
    { title: 'Hereditary', year: 2018 },
    { title: 'Midsommar', year: 2019 },
    { title: 'The Witch', year: 2015 },
    { title: 'It Follows', year: 2014 },
    { title: 'A Quiet Place', year: 2018 },
    { title: 'Bird Box', year: 2018 },
    { title: 'The Mist', year: 2007 },
    { title: 'Saw', year: 2004 },
    { title: 'The Dead Zone', year: 1983 },
    { title: 'The Wicker Man', year: 1973 },
    { title: 'Suspiria', year: 1977 },
    { title: "Rosemary's Baby", year: 1968 },
    { title: 'The Babadook', year: 2014 },
    { title: 'Annihilation', year: 2018 },
    { title: 'The Lighthouse', year: 2019 },
    { title: 'Shadow of the Vampire', year: 2000 },
    { title: 'The Florida Project', year: 2017 },
  ],
  'Fantasy': [
    { title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001 },
    { title: 'The Lord of the Rings: The Two Towers', year: 2002 },
    { title: 'The Lord of the Rings: The Return of the King', year: 2003 },
    { title: 'The Princess Bride', year: 1987 },
    { title: 'Willow', year: 1988 },
    { title: 'Conan the Barbarian', year: 1982 },
    { title: 'Excalibur', year: 1981 },
    { title: 'The Wizard of Oz', year: 1939 },
    { title: 'Matilda', year: 1996 },
    { title: 'The Mummy', year: 1999 },
    { title: 'Hugo', year: 2011 },
    { title: 'Alice in Wonderland', year: 2010 },
    { title: "Pan's Labyrinth", year: 2006 },
    { title: 'The Shape of Water', year: 2017 },
    { title: 'Labyrinth', year: 1986 },
    { title: 'Edward Scissorhands', year: 1990 },
    { title: 'Big Fish', year: 2003 },
    { title: 'Harry Potter and the Prisoner of Azkaban', year: 2004 },
  ],
  'Action': [
    { title: 'Indiana Jones and the Raiders of the Lost Ark', year: 1981 },
    { title: 'The Terminator', year: 1984 },
    { title: 'Die Hard', year: 1988 },
    { title: 'Dirty Harry', year: 1971 },
    { title: 'Inception', year: 2010 },
    { title: 'The Matrix', year: 1999 },
    { title: 'Top Gun', year: 1986 },
    { title: 'The Untouchables', year: 1987 },
    { title: 'Predator', year: 1987 },
    { title: 'Lethal Weapon', year: 1987 },
    { title: 'John Wick', year: 2014 },
    { title: 'Kingsman: The Secret Service', year: 2014 },
    { title: 'GoldenEye', year: 1995 },
    { title: 'From Russia with Love', year: 1963 },
    { title: 'The Bourne Identity', year: 2002 },
    { title: 'Patriot Games', year: 1992 },
    { title: 'First Blood', year: 1982 },
    { title: 'Jack Reacher', year: 2012 },
    { title: 'The Equalizer', year: 2014 },
    { title: 'Kick-Ass', year: 2010 },
    { title: 'Bad Boys', year: 1995 },
    { title: 'Point Break', year: 1991 },
    { title: 'Natural Born Killers', year: 1994 },
    { title: 'Tango & Cash', year: 1989 },
    { title: 'Escape from New York', year: 1981 },
    { title: 'Big Trouble in Little China', year: 1986 },
    { title: 'Tombstone', year: 1993 },
    { title: 'Backdraft', year: 1991 },
    { title: 'Breakdown', year: 1997 },
    { title: 'Unforgiven', year: 1992 },
    { title: 'Gran Torino', year: 2008 },
    { title: 'Escape from Alcatraz', year: 1979 },
    { title: 'The Good, the Bad and the Ugly', year: 1966 },
    { title: 'A Fistful of Dollars', year: 1964 },
    { title: 'The Outlaw Josey Wales', year: 1976 },
    { title: 'Batman', year: 1989 },
    { title: 'A Few Good Men', year: 1992 },
    { title: 'Blade Runner', year: 1982 },
    { title: 'Witness', year: 1985 },
    { title: 'Air Force One', year: 1997 },
    { title: 'Clear and Present Danger', year: 1994 },
    { title: 'Batman Begins', year: 2005 },
    { title: 'The Dark Knight', year: 2008 },
    { title: 'Rescue Dawn', year: 2006 },
    { title: '3:10 to Yuma', year: 2007 },
    { title: 'Fear and Loathing in Las Vegas', year: 1998 },
    { title: 'Blow', year: 2001 },
    { title: 'Pirates of the Caribbean: The Curse of the Black Pearl', year: 2003 },
    { title: 'Iron Man', year: 2008 },
    { title: 'Sherlock Holmes', year: 2009 },
    { title: 'Mad Max', year: 1979 },
    { title: 'Apocalypto', year: 2006 },
    { title: 'Ransom', year: 1996 },
    { title: 'Lone Survivor', year: 2013 },
    { title: 'Four Brothers', year: 2005 },
    { title: 'Under Siege', year: 1992 },
    { title: 'Gladiator', year: 2000 },
  ],
  'Animation': [
    { title: 'Dumbo', year: 1941 },
    { title: 'Toy Story', year: 1995 },
    { title: 'Spider-Man: Into the Spider-Verse', year: 2018 },
    { title: 'Finding Nemo', year: 2003 },
    { title: 'The Incredibles', year: 2004 },
    { title: 'Monsters, Inc.', year: 2001 },
    { title: 'The Jungle Book', year: 1967 },
    { title: 'Wreck-It Ralph', year: 2012 },
    { title: 'Over the Hedge', year: 2006 },
    { title: 'Open Season', year: 2006 },
    { title: 'Chicken Run', year: 2000 },
    { title: '101 Dalmatians', year: 1961 },
    { title: 'Fantastic Mr. Fox', year: 2009 },
    { title: 'Kung Fu Panda', year: 2008 },
    { title: 'Big Hero 6', year: 2014 },
    { title: 'Moana', year: 2016 },
    { title: "A Bug's Life", year: 1998, tmdbId: 9487 },
    { title: 'The Croods', year: 2013 },
    { title: 'Shrek', year: 2001 },
    { title: 'Aladdin', year: 1992 },
    { title: 'Grave of the Fireflies', year: 1988, tmdbId: 12477 },
    { title: 'Spirited Away', year: 2001, tmdbId: 129 },
    { title: 'Princess Mononoke', year: 1997, tmdbId: 128 },
    { title: 'The Iron Giant', year: 1999 },
    { title: 'WALL-E', year: 2008, tmdbId: 10681 },
  ],
  'Sports': [
    { title: 'Rocky', year: 1976 },
    { title: 'Rocky II', year: 1979 },
    { title: 'Raging Bull', year: 1980 },
    { title: 'The Hustler', year: 1961 },
    { title: 'Hoosiers', year: 1986 },
    { title: 'Moneyball', year: 2011 },
    { title: 'The Karate Kid', year: 1984 },
    { title: 'Million Dollar Baby', year: 2004 },
    { title: 'Jerry Maguire', year: 1996 },
    { title: 'Dodgeball: A True Underdog Story', year: 2004 },
    { title: 'The Benchwarmers', year: 2006 },
    { title: 'Rush', year: 2013 },
    { title: 'Major League', year: 1989 },
    { title: 'The Fighter', year: 2010 },
    { title: 'Invincible', year: 2006 },
    { title: 'Miracle', year: 2004 },
    { title: 'A League of Their Own', year: 1992 },
    { title: 'Slap Shot', year: 1977 },
    { title: 'Hustle', year: 2022 },
    { title: 'Draft Day', year: 2014 },
    { title: 'Remember the Titans', year: 2000 },
    { title: 'He Got Game', year: 1998 },
  ],
  'War': [
    { title: 'Apocalypse Now', year: 1979 },
    { title: "Schindler's List", year: 1993 },
    { title: 'Platoon', year: 1986 },
    { title: 'Full Metal Jacket', year: 1987 },
    { title: 'The Great Escape', year: 1963 },
    { title: 'The Bridge on the River Kwai', year: 1957 },
    { title: 'The Deer Hunter', year: 1978 },
    { title: 'Stalag 17', year: 1953 },
    { title: 'Paths of Glory', year: 1957 },
    { title: 'Black Hawk Down', year: 2001 },
    { title: 'Hacksaw Ridge', year: 2016 },
    { title: 'Casualties of War', year: 1989 },
    { title: 'Jarhead', year: 2005 },
    { title: 'Come and See', year: 1985, tmdbId: 11849 },
    { title: 'Das Boot', year: 1981, tmdbId: 387 },
    { title: '1917', year: 2019 },
    { title: 'Fury', year: 2014 },
    { title: 'Dunkirk', year: 2017 },
    { title: 'Gallipoli', year: 1981 },
    { title: 'The Thin Red Line', year: 1998 },
    { title: 'Valkyrie', year: 2008 },
    { title: 'Empire of the Sun', year: 1987 },
    { title: 'Letters from Iwo Jima', year: 2006 },
    { title: 'Greyhound', year: 2020 },
    { title: 'The Covenant', year: 2023 },
    { title: 'Saving Private Ryan', year: 1998 },
  ],
  'Romance': [
    { title: 'When Harry Met Sally...', year: 1989 },
    { title: 'Notting Hill', year: 1999 },
    { title: 'Pretty Woman', year: 1990 },
    { title: 'Sleepless in Seattle', year: 1993 },
    { title: "You've Got Mail", year: 1998 },
    { title: 'The Notebook', year: 2004 },
    { title: 'Roman Holiday', year: 1953 },
    { title: 'Casablanca', year: 1942 },
    { title: 'Brief Encounter', year: 1945 },
    { title: 'Love Actually', year: 2003 },
    { title: "My Best Friend's Wedding", year: 1997 },
    { title: 'Runaway Bride', year: 1999 },
    { title: 'An Officer and a Gentleman', year: 1982 },
    { title: 'Chicago', year: 2002 },
  ],
  'Old Movies': [
    { title: 'Vertigo', year: 1958 },
    { title: 'Rear Window', year: 1954 },
    { title: 'The Birds', year: 1963 },
    { title: 'Rope', year: 1948 },
    { title: 'North by Northwest', year: 1959 },
    { title: 'Notorious', year: 1946 },
    { title: '12 Angry Men', year: 1957 },
    { title: 'The Maltese Falcon', year: 1941 },
    { title: 'Some Like It Hot', year: 1959 },
    { title: 'Sunset Blvd.', year: 1950, tmdbId: 5765 },
    { title: 'Casablanca', year: 1942 },
    { title: 'Seven Samurai', year: 1954, tmdbId: 346 },
    { title: 'The Treasure of the Sierra Madre', year: 1948 },
    { title: 'Ben-Hur', year: 1959 },
    { title: 'Lawrence of Arabia', year: 1962 },
    { title: 'Double Indemnity', year: 1944 },
    { title: 'The Apartment', year: 1960 },
    { title: 'Cool Hand Luke', year: 1967 },
    { title: 'Butch Cassidy and the Sundance Kid', year: 1969 },
    { title: 'The Graduate', year: 1967 },
    { title: "One Flew Over the Cuckoo's Nest", year: 1975 },
    { title: 'Spartacus', year: 1960 },
    { title: 'Goldfinger', year: 1964 },
    { title: 'Mary Poppins', year: 1964 },
    { title: 'The Cincinnati Kid', year: 1965 },
    { title: "Breakfast at Tiffany's", year: 1961 },
    { title: 'The Big Sleep', year: 1946 },
    { title: 'The African Queen', year: 1951 },
    { title: 'Key Largo', year: 1948 },
    { title: 'Network', year: 1976 },
    { title: 'The Wild Bunch', year: 1969 },
    { title: 'The Odd Couple', year: 1968 },
    { title: 'Glengarry Glen Ross', year: 1992 },
    { title: 'The Sting', year: 1973 },
    { title: 'Easy Rider', year: 1969 },
    { title: 'Five Easy Pieces', year: 1970 },
    { title: "It's a Wonderful Life", year: 1946 },
    { title: 'Mr. Smith Goes to Washington', year: 1939 },
    { title: 'Harvey', year: 1950 },
    { title: 'Once Upon a Time in the West', year: 1968 },
    { title: 'The Grapes of Wrath', year: 1940 },
    { title: 'Kind Hearts and Coronets', year: 1949 },
    { title: 'Ace in the Hole', year: 1951 },
    { title: 'Lust for Life', year: 1956 },
    { title: 'To Sir, with Love', year: 1967 },
    { title: 'In the Heat of the Night', year: 1967 },
    { title: "Guess Who's Coming to Dinner", year: 1967 },
  ],
  'Tarantino': [
    { title: 'Pulp Fiction', year: 1994 },
    { title: 'Reservoir Dogs', year: 1992 },
    { title: 'True Romance', year: 1993 },
    { title: 'Kill Bill: Vol. 1', year: 2003 },
    { title: 'Kill Bill: Vol. 2', year: 2004 },
    { title: 'Inglourious Basterds', year: 2009 },
    { title: 'Django Unchained', year: 2012 },
    { title: 'Jackie Brown', year: 1997 },
    { title: 'The Hateful Eight', year: 2015 },
    { title: 'Once Upon a Time in Hollywood', year: 2019 },
    { title: 'Death Proof', year: 2007 },
    { title: 'From Dusk Till Dawn', year: 1996 },
  ],
  'Overrated': [
    { title: 'Shutter Island', year: 2010 },
    { title: 'Inception', year: 2010 },
    { title: 'Superbad', year: 2007 },
    { title: 'The Exorcist', year: 1973 },
    { title: 'The Shining', year: 1980 },
    { title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001 },
    { title: 'Saving Private Ryan', year: 1998 },
    { title: 'Mulholland Drive', year: 2001 },
  ],
  'Underrated': [
    { title: 'The Dead Zone', year: 1983 },
    { title: 'Harry Potter and the Prisoner of Azkaban', year: 2004 },
    { title: 'The Benchwarmers', year: 2006 },
    { title: 'Cop Land', year: 1997 },
  ],
}

const buildAll = () => {
  const seen = new Set()
  const all = []
  Object.values(MASTER_LIST).forEach(films => {
    films.forEach(f => {
      const key = `${f.title}:${f.year}`
      if (!seen.has(key)) { seen.add(key); all.push(f) }
    })
  })
  return all
}

const GENRES = ['All', ...Object.keys(MASTER_LIST)]

const ACTORS = [
  { name: 'Al Pacino', tier: 'S', desc: "The explosion. If there's one actor in this entire list who defines your taste, it's Pacino.", films: "Godfather I & II, Scarface, Heat, Carlito's Way, Serpico, Dog Day Afternoon, Scent of a Woman, The Devil's Advocate, Any Given Sunday, Donnie Brasco" },
  { name: 'Robert De Niro', tier: 'S', desc: "The chameleon. Pacino's eternal counterpart.", films: 'Goodfellas, Casino, The Godfather II, Taxi Driver, Raging Bull, Mean Streets, The Irishman, Heat, A Bronx Tale, Cape Fear, The Deer Hunter, Once Upon a Time in America, Midnight Run' },
  { name: 'Jack Nicholson', tier: 'S', desc: "The natural. You made yourself like The Shining just for him — says everything.", films: "One Flew Over the Cuckoo's Nest, Chinatown, The Shining, A Few Good Men, The Departed, As Good as It Gets, Terms of Endearment, Batman, Five Easy Pieces, About Schmidt" },
  { name: 'Joe Pesci', tier: 'A', desc: 'Terrifying, hilarious, and often both in the same scene.', films: 'Goodfellas, Casino, Raging Bull, My Cousin Vinny, Home Alone, The Irishman, JFK' },
  { name: 'Clint Eastwood', tier: 'A', desc: 'Your Western god.', films: 'Dirty Harry, Unforgiven, Gran Torino, The Good the Bad and the Ugly, Escape from Alcatraz, The Outlaw Josey Wales' },
  { name: 'Gene Hackman', tier: 'A', desc: 'Possibly the most underrated legend in Hollywood history.', films: 'The French Connection, Unforgiven, Enemy of the State, Mississippi Burning, The Royal Tenenbaums, Hoosiers, The Conversation, Night Moves' },
  { name: 'Denzel Washington', tier: 'A', desc: 'The GOAT argument is fully legitimate.', films: 'Training Day, Malcolm X, Glory, Man on Fire, Crimson Tide, Remember the Titans, Fences, Flight, The Hurricane, American Gangster' },
  { name: 'Sean Penn', tier: 'A', desc: 'Intense to the point of spontaneous combustion.', films: "Mystic River, Carlito's Way, Dead Man Walking, Milk, 21 Grams, Fast Times at Ridgemont High" },
  { name: 'Philip Seymour Hoffman', tier: 'A', desc: 'Range from pizza-grease comedy to Best Actor Oscar. Gone too soon.', films: "Capote, Magnolia, Boogie Nights, The Master, Doubt, Almost Famous, Along Came Polly, The Big Lebowski, Before the Devil Knows You're Dead" },
  { name: 'Brad Pitt', tier: 'A', desc: 'Spent a decade being dismissed as just a pretty face. Then Fight Club came out and everyone shut up.', films: "Se7en, Fight Club, Inglourious Basterds, Fury, Moneyball, Ocean's Eleven, Snatch, Once Upon a Time in Hollywood, 12 Years a Slave" },
  { name: 'Edward Norton', tier: 'A', desc: 'Possibly the best pure acting debut in Hollywood history with Primal Fear. Criminally underused since.', films: 'American History X, Fight Club, Primal Fear, The Italian Job, 25th Hour, Moonrise Kingdom' },
  { name: 'Gary Oldman', tier: 'A', desc: 'Disappears completely into every role. The benchmark for chameleon acting.', films: 'Leon: The Professional, The Dark Knight, True Romance, JFK, Tinker Tailor Soldier Spy, Darkest Hour' },
  { name: 'Harvey Keitel', tier: 'A', desc: "Scorsese's original muse. Showed everyone how to do raw and real.", films: 'Pulp Fiction, Reservoir Dogs, Taxi Driver, Mean Streets, Bad Lieutenant, From Dusk Till Dawn, The Piano' },
  { name: 'Julia Roberts', tier: 'A', desc: 'The last true Hollywood movie star in the classic sense.', films: "Pretty Woman, Erin Brockovich, My Best Friend's Wedding, Notting Hill, Ocean's Eleven, Charlie Wilson's War" },
  { name: 'Natalie Portman', tier: 'A', desc: 'Started as a 12-year-old opposite Keitel and never looked back.', films: 'Leon: The Professional, Black Swan, Closer, V for Vendetta, Jackie' },
  { name: 'Christopher Walken', tier: 'A', desc: 'Nobody on earth delivers a line like Walken. Every scene is an event.', films: 'The Deer Hunter, True Romance, King of New York, Catch Me If You Can' },
  { name: 'Christian Bale', tier: 'A', desc: 'Commits harder than anyone alive. Lost 60 pounds for a role. Twice.', films: 'Batman Begins, The Dark Knight, The Fighter, American Psycho, The Prestige, 3:10 to Yuma, Rescue Dawn' },
  { name: 'Robin Williams', tier: 'A', desc: 'Funniest man alive and one of the most emotionally devastating actors alive. Same person.', films: "Good Will Hunting, Dead Poets Society, Aladdin, Awakenings, Mrs. Doubtfire, Good Morning Vietnam, The Fisher King" },
  { name: 'Kevin Spacey', tier: 'A', desc: 'Villain energy at all times, even when playing the hero.', films: "The Usual Suspects, Se7en, L.A. Confidential, American Beauty, Swimming with Sharks" },
  { name: 'Harrison Ford', tier: 'A', desc: 'Never had a bad decade.', films: 'Indiana Jones, The Fugitive, Blade Runner, Air Force One, Patriot Games, Witness, Clear and Present Danger' },
  { name: 'Sylvester Stallone', tier: 'A', desc: 'Massively underrated as a serious actor when he actually tries.', films: 'Rocky I & II, First Blood, Cop Land, Nighthawks' },
  { name: 'Mark Wahlberg', tier: 'A', desc: 'Best when gritty. Worst when doing comedy.', films: 'Boogie Nights, The Departed, The Fighter, Lone Survivor, Four Brothers, Invincible' },
  { name: 'Robert Duvall', tier: 'A', desc: 'The most undersung legend in Hollywood.', films: 'The Godfather, Apocalypse Now, MASH, To Kill a Mockingbird, The Apostle, Tender Mercies, The Great Santini' },
  { name: 'Tom Hanks', tier: 'A', desc: "You've put him on the overrated list and he's all over your movie list. The most conflicted relationship in your entire filmography.", films: 'Forrest Gump, Cast Away, Philadelphia, The Green Mile, Road to Perdition, Saving Private Ryan' },
  { name: 'Russell Crowe', tier: 'B', desc: 'Massively underrated post-Gladiator.', films: "Gladiator, L.A. Confidential, The Insider, A Beautiful Mind, Cinderella Man, Master and Commander" },
  { name: 'James Gandolfini', tier: 'B', desc: 'Not enough films but every single one counts.', films: 'The Sopranos, The Drop, Zero Dark Thirty' },
  { name: 'Steve Buscemi', tier: 'B', desc: 'Appears in nearly every film you love, usually stealing the scene.', films: 'Fargo, Reservoir Dogs, The Big Lebowski, Boardwalk Empire, Con Air, Armageddon' },
  { name: 'Johnny Depp', tier: 'B', desc: 'Pre-2010 Depp is a different human entirely.', films: 'Donnie Brasco, Fear and Loathing, Blow, Ed Wood, Pirates of the Caribbean, Sleepy Hollow, Edward Scissorhands' },
  { name: 'Adam Sandler', tier: 'B', desc: 'Uncut Gems proves he can genuinely act when he stops goofing around.', films: 'Happy Gilmore, Billy Madison, Uncut Gems, The Wedding Singer, Grown Ups' },
  { name: 'Ben Stiller', tier: 'B', desc: 'King of 2000s comedy without question.', films: 'Zoolander, Tropic Thunder, Meet the Parents, Dodgeball, Along Came Polly' },
  { name: 'Will Ferrell', tier: 'B', desc: 'The comedy workhorse who also did a legitimately great drama.', films: 'Elf, Anchorman, Step Brothers, Talladega Nights, Old School, Stranger Than Fiction' },
  { name: 'Bill Murray', tier: 'B', desc: "Impossible to explain why he's this good. Just is.", films: 'Groundhog Day, Lost in Translation, Rushmore, Stripes, Ghostbusters, Kingpin' },
  { name: 'Tommy Lee Jones', tier: 'B', desc: "Gruff genius. Every scene he's in, he wins.", films: 'No Country for Old Men, The Fugitive, JFK, Under Siege, Men in Black' },
  { name: 'Morgan Freeman', tier: 'B', desc: "The voice of God and the moral compass of every film he's in.", films: "The Shawshank Redemption, Se7en, Unforgiven, Million Dollar Baby, American History X, The Bucket List" },
  { name: 'Matt Damon', tier: 'B', desc: 'Mr. Consistent.', films: "Good Will Hunting, The Departed, Rounders, The Talented Mr. Ripley, The Martian, Ocean's Eleven" },
  { name: 'Kurt Russell', tier: 'B', desc: "Peak 80s/90s cool that nobody talks about enough.", films: 'The Thing, Escape from New York, Tombstone, Tango & Cash, Big Trouble in Little China, Breakdown, Backdraft' },
  { name: 'Mel Gibson', tier: 'B', desc: "Best when he's playing someone barely holding it together.", films: 'Braveheart, Payback, Mad Max, Apocalypto, Ransom, The Patriot' },
  { name: 'Dustin Hoffman', tier: 'B', desc: 'Two Best Actor Oscars and somehow still underappreciated.', films: "Rain Man, Midnight Cowboy, Kramer vs. Kramer, Tootsie, Marathon Man, All the President's Men" },
  { name: 'Robert Downey Jr.', tier: 'B', desc: 'Nobody does charming and unhinged at the same time better.', films: 'Iron Man, Chaplin, Zodiac, Tropic Thunder, Oppenheimer, Sherlock Holmes, Kiss Kiss Bang Bang' },
  { name: 'Richard Gere', tier: 'B', desc: 'Criminally overlooked as a serious actor because he was too handsome.', films: 'Pretty Woman, Primal Fear, American Gigolo, Chicago, An Officer and a Gentleman, Internal Affairs' },
  { name: 'Ewan McGregor', tier: 'B', desc: 'Trainspotting alone earns his place on any list.', films: 'Trainspotting, Moulin Rouge, Black Hawk Down, Big Fish, The Men Who Stare at Goats, Brassed Off' },
  { name: 'Willem Dafoe', tier: 'B', desc: 'Four Oscar nominations. Zero wins. Greatest robbery in Academy history.', films: "Platoon, Shadow of the Vampire, The Florida Project, At Eternity's Gate, To Live and Die in L.A., The Last Temptation of Christ" },
  { name: 'Jack Black', tier: 'B', desc: 'Constantly underestimated. School of Rock is a masterclass.', films: 'School of Rock, Tropic Thunder, High Fidelity, King Kong, Tenacious D' },
  { name: 'Billy Crystal', tier: 'B', desc: 'The king of 90s comedy and the reason the Romance section exists.', films: 'When Harry Met Sally, City Slickers, The Princess Bride, Analyze This' },
  { name: 'Danny McBride', tier: 'B', desc: 'The most committed idiot in Hollywood. Means it as a compliment.', films: 'Pineapple Express, Tropic Thunder, This Is the End, The Foot Fist Way, Observe and Report' },
  { name: 'Humphrey Bogart', tier: 'G', desc: 'The OG. Every actor who came after owes him something.', films: 'Casablanca, The Maltese Falcon, The African Queen, The Big Sleep, Treasure of the Sierra Madre' },
  { name: 'James Stewart', tier: 'G', desc: "America's conscience on screen.", films: "It's a Wonderful Life, Rear Window, Vertigo, Mr. Smith Goes to Washington, Harvey" },
  { name: 'Henry Fonda', tier: 'G', desc: 'Righteous fury in human form.', films: '12 Angry Men, Once Upon a Time in the West, The Grapes of Wrath' },
  { name: 'Jack Lemmon', tier: 'G', desc: 'Lemmon and Matthau invented the buddy dynamic.', films: 'Some Like It Hot, The Apartment, The Odd Couple, Glengarry Glen Ross' },
  { name: 'Paul Newman', tier: 'G', desc: 'Cool hand. Cool man. Cool everything.', films: 'The Hustler, Butch Cassidy, Cool Hand Luke, The Sting, Slap Shot' },
  { name: 'Steve McQueen', tier: 'G', desc: 'The King of Cool. The ceiling for on-screen charisma.', films: 'The Great Escape, Papillon, The Cincinnati Kid, Bullitt' },
  { name: 'Sidney Poitier', tier: 'G', desc: 'Paved every road that came after him.', films: "In the Heat of the Night, To Sir with Love, Guess Who's Coming to Dinner, Lilies of the Field" },
  { name: 'Alec Guinness', tier: 'G', desc: 'British acting perfection. Eight roles in one film. Enough said.', films: 'Bridge on the River Kwai, Kind Hearts and Coronets, Lawrence of Arabia' },
  { name: 'Kirk Douglas', tier: 'G', desc: 'The original Hollywood tough guy who also had a brain.', films: 'Spartacus, Paths of Glory, Ace in the Hole, Lust for Life' },
  { name: 'William Holden', tier: 'G', desc: 'The everyman who could carry absolutely anything.', films: "Sunset Blvd., Stalag 17, The Bridge on the River Kwai, Network, The Wild Bunch" },
]

const TIER_LABELS = { S: 'S Tier — The Holy Trinity', A: 'A Tier — The Legends & Reliables', B: 'B Tier — The Specialists', G: 'Golden Age Legends' }
const TIER_COLORS = { S: '#f1c40f', A: '#c0392b', B: '#2980b9', G: '#8e44ad' }

const searchMovie = async ({ title, year, tmdbId }) => {
  try {
    if (tmdbId) {
      const data = await tmdb(`/movie/${tmdbId}`)
      return data?.id ? data : null
    }
    const data = await tmdb('/search/movie', { query: title, language: 'en-US' })
    const results = data.results || []
    const match = results.find(r => {
      const ry = parseInt(r.release_date?.slice(0,4))
      return Math.abs(ry - year) <= 1
    })
    return match || results[0] || null
  } catch { return null }
}

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

function MovieCard({ movie, entry, communityEntries, onOpen }) {
  const poster = movie.poster_path ? `${TMDB_IMG}/w342${movie.poster_path}` : null
  const cardRef = useRef()
  const [faded, setFaded] = useState(false)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([e]) => { setFaded(!e.isIntersecting) },
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Calculate community average from all entries with ratings
  const ratedEntries = (communityEntries || []).filter(e => e.user_rating)
  const communityAvg = ratedEntries.length > 0
    ? (ratedEntries.reduce((s, e) => s + e.user_rating, 0) / ratedEntries.length).toFixed(1)
    : null

  return (
    <div ref={cardRef} className={`nf-movie-card${faded ? ' nf-fade-out' : ''}`} onClick={() => onOpen(movie, entry)}>
      <div className="nf-movie-poster">
        {poster ? <img src={poster} alt={movie.title} loading="lazy" /> : <div className="nf-movie-no-poster">🎬</div>}
        {entry && <div className={`nf-movie-status-badge ${entry.status}`}>{entry.status === 'watched' ? '✓ Watched' : '+ Watchlist'}</div>}
        {entry?.user_rating && <div className="nf-movie-rating-badge">{entry.user_rating}/10</div>}
        {communityAvg && !entry?.user_rating && (
          <div className="nf-movie-community-badge">★ {communityAvg} ({ratedEntries.length})</div>
        )}
        {communityAvg && entry?.user_rating && (
          <div className="nf-movie-community-badge">★ {communityAvg} ({ratedEntries.length})</div>
        )}
        <div className="nf-movie-overlay"><span className="nf-movie-overlay-text">View Details</span></div>
      </div>
      <div className="nf-movie-info">
        <span className="nf-movie-title">{movie.title}</span>
        <span className="nf-movie-year">{movie.release_date?.slice(0,4)}</span>
      </div>
    </div>
  )
}

function MovieModal({ movie, entry, userId, allEntries, onClose, onSave }) {
  const [status, setStatus] = useState(entry?.status || null)
  const [rating, setRating] = useState(entry?.user_rating || 0)
  const [comment, setComment] = useState(entry?.comment || '')
  const [saving, setSaving] = useState(false)
  const [details, setDetails] = useState(null)
  const [communityProfiles, setCommunityProfiles] = useState({})

  useEffect(() => { tmdb(`/movie/${movie.id}`, { append_to_response: 'videos,credits' }).then(setDetails) }, [movie.id])

  // Load display names for community entries
  useEffect(() => {
    const otherEntries = (allEntries || []).filter(e => e.user_id !== userId)
    if (!otherEntries.length) return
    const ids = [...new Set(otherEntries.map(e => e.user_id))]
    supabase.from('profiles').select('id, display_name').in('id', ids).then(({ data }) => {
      if (!data) return
      const map = {}
      data.forEach(p => { map[p.id] = p.display_name || 'Nicktopian' })
      setCommunityProfiles(map)
    })
  }, [allEntries, userId])

  const trailer = details?.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
  const director = details?.credits?.crew?.find(c => c.job === 'Director')
  const cast = details?.credits?.cast?.slice(0, 5)

  // Community entries = other users who have rated/reviewed this movie
  const communityReviews = (allEntries || []).filter(e =>
    e.user_id !== userId && (e.user_rating || e.comment)
  )

  const save = async () => {
    if (!userId) return
    setSaving(true)
    await supabase.from('watchlist').upsert({
      user_id: userId, tmdb_id: movie.id, title: movie.title,
      poster_path: movie.poster_path, status,
      user_rating: rating || null, comment: comment || null,
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
              <button className={`nf-action-btn ${status === 'watchlist' ? 'active-watch' : ''}`} onClick={() => setStatus(s => s === 'watchlist' ? null : 'watchlist')}>{status === 'watchlist' ? '✓ In Watchlist' : '+ Watchlist'}</button>
              <button className={`nf-action-btn ${status === 'watched' ? 'active-seen' : ''}`} onClick={() => setStatus(s => s === 'watched' ? null : 'watched')}>{status === 'watched' ? '✓ Watched' : 'Mark Watched'}</button>
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
            <div className="nf-modal-divider" />
            <div className="nf-modal-section"><span className="nf-modal-label">Your Rating</span><StarRating value={rating} onChange={setRating} /></div>
            <div className="nf-modal-section"><span className="nf-modal-label">Your Review</span><textarea className="nf-comment-input" placeholder="What did you think?" value={comment} onChange={e => setComment(e.target.value)} rows={3} /></div>
            <div className="nf-modal-footer">
              {entry && <button className="nf-remove-btn" onClick={remove}>Remove</button>}
              <button className="nf-save-btn" onClick={save} disabled={saving || !status}>{saving ? 'Saving...' : 'Save'}</button>
            </div>

            {/* Community Reviews */}
            {communityReviews.length > 0 && (
              <>
                <div className="nf-modal-divider" />
                <div className="nf-modal-section">
                  <span className="nf-modal-label">What Others Think ({communityReviews.length})</span>
                  <div className="nf-community-reviews">
                    {communityReviews.map((r, i) => (
                      <div key={i} className="nf-community-review">
                        <div className="nf-review-header">
                          <span className="nf-review-name">{communityProfiles[r.user_id] || 'Nicktopian'}</span>
                          {r.user_rating && <span className="nf-review-rating">★ {r.user_rating}/10</span>}
                        </div>
                        <div className="nf-review-status">{r.status === 'watched' ? '✓ Watched' : '+ Watchlist'}</div>
                        {r.comment && <div className="nf-review-comment">"{r.comment}"</div>}
                      </div>
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

function ActorCard({ actor, onClick }) {
  const [photo, setPhoto] = useState(null)
  useEffect(() => {
    tmdb('/search/person', { query: actor.name }).then(data => {
      const p = data.results?.[0]
      if (p?.profile_path) setPhoto(`${TMDB_IMG}/w185${p.profile_path}`)
    })
  }, [actor.name])
  return (
    <div className="nf-actor-card" onClick={() => onClick(actor, photo)}>
      <div className="nf-actor-photo">
        {photo ? <img src={photo} alt={actor.name} loading="lazy" /> : <div className="nf-actor-no-photo">{actor.name.charAt(0)}</div>}
        <div className="nf-actor-tier-badge" style={{ background: TIER_COLORS[actor.tier] }}>{actor.tier === 'G' ? 'GOLD' : actor.tier}</div>
      </div>
      <div className="nf-actor-info">
        <span className="nf-actor-name">{actor.name}</span>
        <span className="nf-actor-desc">{actor.desc}</span>
      </div>
    </div>
  )
}

function ActorModal({ actor, photo, onClose }) {
  const [fullDetails, setFullDetails] = useState(null)
  useEffect(() => {
    tmdb('/search/person', { query: actor.name }).then(async data => {
      const person = data.results?.[0]
      if (person?.id) {
        const details = await tmdb(`/person/${person.id}`, { append_to_response: 'movie_credits' })
        setFullDetails(details)
      }
    })
  }, [actor.name])
  const topMovies = fullDetails?.movie_credits?.cast?.sort((a, b) => (b.popularity||0)-(a.popularity||0))?.slice(0,8)
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
          </div>
        </div>
      </div>
    </div>
  )
}

function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef()
  const search = useCallback((q) => {
    clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const data = await tmdb('/search/movie', { query: q, language: 'en-US' })
      setResults(data.results?.slice(0,6) || [])
      setLoading(false)
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

function WatchlistCard({ entry, communityEntries, onOpen }) {
  const [movie, setMovie] = useState(null)
  useEffect(() => { tmdb(`/movie/${entry.tmdb_id}`).then(setMovie) }, [entry.tmdb_id])
  if (!movie) return <div className="nf-movie-card nf-skeleton" />

  const ratedEntries = (communityEntries || []).filter(e => e.user_rating)
  const communityAvg = ratedEntries.length > 0
    ? (ratedEntries.reduce((s, e) => s + e.user_rating, 0) / ratedEntries.length).toFixed(1)
    : null

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

export default function Nickflix({ user }) {
  const [view, setView] = useState('movies')
  const [activeGenre, setActiveGenre] = useState('Crime')
  const [movies, setMovies] = useState([])
  const [watchlist, setWatchlistData] = useState([])
  const [allWatchlist, setAllWatchlist] = useState([]) // all users' entries
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [selectedMovieEntry, setSelectedMovieEntry] = useState(null)
  const [selectedActor, setSelectedActor] = useState(null)
  const [selectedActorPhoto, setSelectedActorPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTier, setActiveTier] = useState('All')

  const loadWatchlist = useCallback(async () => {
    if (!user?.id) return
    const { data } = await supabase.from('watchlist').select('*').eq('user_id', user.id)
    setWatchlistData(data || [])
  }, [user?.id])

  const loadAllWatchlist = useCallback(async () => {
    const { data } = await supabase.from('watchlist').select('*')
    setAllWatchlist(data || [])
  }, [])

  useEffect(() => {
    loadWatchlist()
    loadAllWatchlist()
  }, [loadWatchlist, loadAllWatchlist])

  const fetchMovies = useCallback(async (genre) => {
    setLoading(true)
    setMovies([])
    const filmList = genre === 'All' ? buildAll() : MASTER_LIST[genre] || []
    const batchSize = 8
    for (let i = 0; i < filmList.length; i += batchSize) {
      const batch = filmList.slice(i, i + batchSize)
      const batchResults = await Promise.all(batch.map(searchMovie))
      setMovies(prev => {
        const seen = new Set(prev.map(m => m.id))
        return [...prev, ...batchResults.filter(r => r && !seen.has(r.id))]
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (view === 'movies') fetchMovies(activeGenre)
  }, [activeGenre, view])

  // Build maps
  const watchlistMap = {}
  watchlist.forEach(w => { watchlistMap[w.tmdb_id] = w })

  // Group all entries by tmdb_id for community data
  const allEntriesMap = {}
  allWatchlist.forEach(w => {
    if (!allEntriesMap[w.tmdb_id]) allEntriesMap[w.tmdb_id] = []
    allEntriesMap[w.tmdb_id].push(w)
  })

  const openMovie = (movie, entry) => {
    setSelectedMovie(movie)
    setSelectedMovieEntry(entry || watchlistMap[movie.id] || null)
  }

  const filteredActors = activeTier === 'All' ? ACTORS : ACTORS.filter(a => a.tier === activeTier)
  const watchedMovies = watchlist.filter(w => w.status === 'watched')
  const toWatchMovies = watchlist.filter(w => w.status === 'watchlist')

  const handleSave = () => {
    loadWatchlist()
    loadAllWatchlist()
  }

  return (
    <div className="nickflix">
      <div className="nf-cinema-header">
        <div className="nf-curtain nf-curtain-left" />
        <div className="nf-curtain nf-curtain-right" />
        <div className="nf-spotlight nf-spotlight-left" />
        <div className="nf-spotlight nf-spotlight-right" />
        <div className="nf-header-content">
          <h1 className="nf-title">NICKFLIX</h1>
          <p className="nf-subtitle">Nick's Personal Cinema</p>
        </div>
      </div>

      {/* Sticky tab nav */}
      <div className="nf-nav">
        <div className="nf-nav-inner">
          {[{ id: 'movies', label: '🎬 Browse' }, { id: 'actors', label: '⭐ Actors' }, { id: 'watchlist', label: `📋 My List (${watchlist.length})` }].map(tab => (
            <button key={tab.id} className={`nf-nav-btn ${view === tab.id ? 'active' : ''}`} onClick={() => setView(tab.id)}>{tab.label}</button>
          ))}
          <div className="nf-nav-search"><SearchBar onSelect={m => { setView('movies'); openMovie(m, null) }} /></div>
        </div>
      </div>

      {view === 'movies' && (
        <div className="nf-movies-view">
          {/* Sticky genre bar */}
          <div className="nf-genre-bar-wrap">
            <div className="nf-genre-bar">
              {GENRES.map(g => (
                <button key={g} className={`nf-genre-btn ${activeGenre === g ? 'active' : ''}`} onClick={() => setActiveGenre(g)}>{g}</button>
              ))}
            </div>
          </div>

          {loading && movies.length === 0 ? (
            <div className="nf-loading"><div className="nf-film-reel">🎞️</div><p>Loading films...</p></div>
          ) : (
            <>
              {loading && <div className="nf-loading-bar"><div className="nf-loading-bar-inner" /></div>}
              <div className="nf-movies-grid">
                {movies.map(movie => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    entry={watchlistMap[movie.id]}
                    communityEntries={allEntriesMap[movie.id]}
                    onOpen={openMovie}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {view === 'actors' && (
        <div className="nf-actors-view">
          <div className="nf-tier-filter">
            {['All', 'S', 'A', 'B', 'G'].map(t => (
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
                  {actors.map(actor => <ActorCard key={actor.name} actor={actor} onClick={(a,p) => { setSelectedActor(a); setSelectedActorPhoto(p) }} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'watchlist' && (
        <div className="nf-watchlist-view">
          {watchlist.length === 0 ? (
            <div className="nf-empty">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎬</div>
              <p>Your list is empty. Start browsing and add some films.</p>
              <button className="nf-save-btn" onClick={() => setView('movies')} style={{ marginTop: '1rem' }}>Browse Films</button>
            </div>
          ) : (
            <>
              {toWatchMovies.length > 0 && (
                <div className="nf-watchlist-section">
                  <h2 className="nf-watchlist-title">📋 To Watch ({toWatchMovies.length})</h2>
                  <div className="nf-watchlist-grid">
                    {toWatchMovies.map(w => (
                      <WatchlistCard key={w.id} entry={w} communityEntries={allEntriesMap[w.tmdb_id]} onOpen={openMovie} />
                    ))}
                  </div>
                </div>
              )}
              {watchedMovies.length > 0 && (
                <div className="nf-watchlist-section">
                  <h2 className="nf-watchlist-title">✓ Watched ({watchedMovies.length})</h2>
                  <div className="nf-watchlist-grid">
                    {watchedMovies.map(w => (
                      <WatchlistCard key={w.id} entry={w} communityEntries={allEntriesMap[w.tmdb_id]} onOpen={openMovie} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          entry={selectedMovieEntry}
          userId={user?.id}
          allEntries={allEntriesMap[selectedMovie.id]}
          onClose={() => { setSelectedMovie(null); setSelectedMovieEntry(null) }}
          onSave={handleSave}
        />
      )}
      {selectedActor && <ActorModal actor={selectedActor} photo={selectedActorPhoto} onClose={() => { setSelectedActor(null); setSelectedActorPhoto(null) }} />}
    </div>
  )
}