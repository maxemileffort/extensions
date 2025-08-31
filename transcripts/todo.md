# Transcript Automator - TODO List

This document outlines potential improvements, bug fixes, and new features for the Transcript Automator Chrome Extension.

## High Priority

*   [ ] **Improve YouTube Transcript Extraction Robustness:**
    *   Enhance selectors for "More actions" and "Show transcript" buttons to be more resilient to YouTube UI changes.
    *   Consider alternative methods for directly accessing transcript data if available via YouTube's API or hidden elements.
    *   Handle cases where transcripts are not available or are in a different language.
*   [ ] **Refine Job Description Extraction:**
    *   Continuously monitor and update selectors for LinkedIn, Greenhouse, Lever, and Dice as their website structures may change.
    *   Add support for more job boards (e.g., Indeed, Glassdoor, company career pages).
    *   Implement more sophisticated text cleaning for job descriptions (e.g., removing headers, footers, irrelevant sections).
*   [ ] **Gemini API Error Handling and User Feedback:**
    *   Provide more specific error messages to the user when the Gemini API call fails (e.g., invalid API key, rate limiting, network issues).
    *   Implement a retry mechanism for transient API errors.
    *   Add a loading indicator during summarization.

## Medium Priority

*   [ ] **Summarization Quality Improvement:**
    *   Experiment with different Gemini models or prompt engineering techniques to improve summary quality and conciseness.
    *   Allow users to choose summarization length (e.g., short, medium, detailed).
*   [ ] **User Interface Enhancements:**
    *   Improve the styling of the popup for a better user experience.
    *   Add a clear indication of which platform the content was extracted from (e.g., "YouTube Transcript", "LinkedIn Job Description").
    *   Consider adding a "Clear" button to reset the popup content.
*   [ ] **Local Storage for Transcripts/Summaries:**
    *   Implement an option to save extracted transcripts and summaries locally within the browser for later review.

## Low Priority / Future Enhancements

*   [ ] **Export Options:** Allow users to export transcripts/summaries to different formats (e.g., TXT, PDF, Markdown).
*   [ ] **Customizable Extraction Rules:** Allow advanced users to define their own CSS selectors for extracting content from unsupported websites.
*   [ ] **Multi-language Support:** Detect and handle transcripts/job descriptions in multiple languages.
*   [ ] **Integration with Other Tools:** Explore integrations with note-taking apps or productivity tools.
*   [ ] **Automated Summarization Toggle:** Add an option to automatically summarize content upon extraction, without requiring a separate click.
