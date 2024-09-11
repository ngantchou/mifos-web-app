import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Custums {

  constructor() {}

  public numberToWordsEn(number:any) {
    const units = [
      "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
      "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
      "seventeen", "eighteen", "nineteen"
    ];
  
    const tens = [
      "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
    ];
  
    const thousands = [
      "", "thousand", "million", "billion", "trillion"
    ];
  
    if (number === 0) {
      return "zero";
    }
  
    const parts = [];
    let i = 0;
  
    while (number > 0) {
      const hundreds = number % 1000;
      number = Math.floor(number / 1000);
  
      if (hundreds > 0) {
        const part = [];
        if (hundreds >= 100) {
          part.push(units[Math.floor(hundreds / 100)] + " hundred");
        }
        if (hundreds % 100 >= 20) {
          part.push(tens[Math.floor((hundreds % 100) / 10)] + " " + units[hundreds % 10]);
        } else if (hundreds % 100 > 0) {
          part.push(units[hundreds % 100]);
        }
        part.push(thousands[i]);
        parts.unshift(part.join(" "));
      }
  
      i++;
    }
  
    return parts.join(" ");
  }
  public numberToWordsFr(number: any) {
    console.log(number)
    const units = [
      "", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
      "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept",
      "dix-huit", "dix-neuf"
    ];
  
    const tens = [
      "", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix",
      "quatre-vingt", "quatre-vingt-dix"
    ];
  
    const thousands = [
      "", "mille", "million", "milliard", "billion"
    ];
  
    if (number === 0) {
      return "zéro";
    }
  
    const parts = [];
    let i = 0;
  
    while (number > 0) {
      const hundreds = number % 1000;
      number = Math.floor(number / 1000);
  
      if (hundreds > 0) {
        const part = [];
        if (hundreds >= 100) {
          if (Math.floor(hundreds / 100) === 1) {
            part.push("cent");
          } else {
            part.push(units[Math.floor(hundreds / 100)] + " cent");
          }
        }
        if (hundreds % 100 >= 20) {
          const tensUnit = Math.floor((hundreds % 100) / 10);
          let tensWord = tens[tensUnit];
  
          // Handle exceptions for 70-79, 90-99 in French
          if (tensUnit === 7 || tensUnit === 9) {
            tensWord = tens[tensUnit - 1] + "-" + units[10 + (hundreds % 10)];
          } else if (hundreds % 10 > 0) {
            tensWord += "-" + units[hundreds % 10];
          }
  
          part.push(tensWord);
        } else if (hundreds % 100 > 0) {
          part.push(units[hundreds % 100]);
        }
        part.push(thousands[i]);
        parts.unshift(part.join(" "));
      }
  
      i++;
    }
  
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }
  
}
