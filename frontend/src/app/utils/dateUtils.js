/**
 * Formats a date into DD.MM.YYYY format
 */
export function formatDate(date) {
    // Return empty string if date is null or undefined
    if (!date) return "";
    
    // Convert to Date object if it's not already
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return "";
    
    // Get date components
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    
    // Return formatted date
    return `${day}.${month}.${year}`;
  }