import { getDayOfYear, getHours } from 'date-fns';
import quotes from './notifications.json';

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

interface Quote {
    timeOfDay: TimeOfDay;
    text: string;
}

export function getTodaysQuote(): Quote {
    const now = new Date();
    const hour = getHours(now);
    const dayIndex = getDayOfYear(now);

    let timeOfDay: TimeOfDay;
    let applicableQuotes: string[];

    if (hour >= 5 && hour < 12) {
        timeOfDay = 'morning';
        applicableQuotes = quotes.morning;
    } else if (hour >= 12 && hour < 18) {
        timeOfDay = 'afternoon';
        applicableQuotes = quotes.afternoon;
    } else {
        timeOfDay = 'evening';
        applicableQuotes = quotes.evening;
    }

    // Use modulo to cycle through quotes daily
    const quoteIndex = dayIndex % applicableQuotes.length;
    const text = applicableQuotes[quoteIndex];

    return { timeOfDay, text };
}
