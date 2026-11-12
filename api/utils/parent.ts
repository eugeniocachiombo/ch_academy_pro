export const prepareParentPersonData = (body: any) => {
    const names = (body.fullname || 'Responsável Default').trim().split(' ');
    const firstname = names[0] || 'Responsável';
    const lastname = names.length > 1 ? names[names.length - 1] : 'Default';
    const middlename = names.length > 2 ? names.slice(1, -1).join(' ') : 'Default';

    const person = body.person || {};

    let birthday = '1990-01-01T00:00:00.000Z';
    if (person.birthday) {
        birthday = person.birthday.includes('T') ? person.birthday : new Date(person.birthday).toISOString();
    }

    const biNumber = person.bi_number || `BI${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const uniqueEmail = person.email || `parent_${Date.now()}_${Math.floor(Math.random() * 10000)}@parent.com`;

    return {
        ...body,
        person: {
            firstname: person.firstname || firstname,
            middlename: person.middlename || middlename,
            lastname: person.lastname || lastname,
            birthday,
            gender: person.gender || 'M',
            bi_number: biNumber,
            nif: person.nif || biNumber,
            phone: person.phone || body.phone || '900000000',
            alternative_phone: person.alternative_phone || '000000000',
            email: uniqueEmail,
            province: person.province || 'Default',
            municipality: person.municipality || 'Default',
            neighborhood: person.neighborhood || 'Default',
            street: person.street || 'Default',
            house_number: person.house_number || '0'
        }
    };
};