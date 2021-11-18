const numberThEnds = (number) => {
    const value = parseInt(number);
    if (isNaN(value)) {
        return '';
    }
    if (value % 10 == 1 && value % 100 != 11) {
        return 'st';
    } else if (value % 10 == 2 && value % 100 != 12) {
        return 'nd';
    } else if (value % 10 == 3 && value % 100 != 13) {
        return 'rd';
    } else {
        return 'th';
    }
}

exports.numberThEnds = numberThEnds;