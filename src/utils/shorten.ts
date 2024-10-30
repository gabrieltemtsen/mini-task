export function shortenAddress(address: string) {
    if (address && address.length > 10) {
      return `${address.slice(0, 4)}...${address.slice(-2)}`;
    }
    return address; // Return the original address if it's too short to shorten
  }

  export function shortenText(text: string, maxLength: number) {
    if (text.length > maxLength) {
      return `${text.slice(0, maxLength)}...`;
    }
    return text;
  }
