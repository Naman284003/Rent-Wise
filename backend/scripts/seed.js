import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { Property } from '../models/Property.js';
import { Room } from '../models/Room.js';
import { TenantAssignment } from '../models/TenantAssignment.js';
import { RentRecord } from '../models/RentRecord.js';
import { Payment } from '../models/Payment.js';
import { Complaint } from '../models/Complaint.js';

export async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      // If a database exists but the configured admin is missing (e.g. a pre-existing
      // collection), ensure the admin account still exists so login never fails.
      const adminExists = await User.findOne({ email: config.initialAdmin.email.toLowerCase() });
      if (adminExists) {
        console.log('[Seed] Database already contains records. Skipping seed.');
        return;
      }
      console.log('[Seed] Existing database found without configured admin. Creating admin account...');
      const salt = await bcrypt.genSalt(10);
      await User.create({
        name: config.initialAdmin.name,
        email: config.initialAdmin.email.toLowerCase(),
        password: await bcrypt.hash(config.initialAdmin.password, salt),
        role: 'admin',
        phone: '+91 98201 11004',
        isActive: true,
      });
      console.log(`[Seed] Admin account ready: ${config.initialAdmin.email.toLowerCase()}`);
      return;
    }

    console.log('[Seed] Seeding RentWise with realistic Indian property data...');

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash(config.initialAdmin.password, salt);
    const landlordPass = await bcrypt.hash('Landlord@123', salt);
    const tenantPass = await bcrypt.hash('Tenant@123', salt);

    // 1. Admin Account
    await User.create({
      name: config.initialAdmin.name,
      email: config.initialAdmin.email.toLowerCase(),
      password: adminPass,
      role: 'admin',
      phone: '+91 98201 11004',
      isActive: true,
    });

    // 2. Landlords (4)
    const landlordVikram = await User.create({
      name: 'Vikramaditya Deshmukh',
      email: 'landlord@rentwise.in',
      password: landlordPass,
      role: 'landlord',
      phone: '+91 98230 45120',
      isActive: true,
      avatar: '/assets/images/indian_landlord_portrait_1795086775127.jpg',
    });

    const landlordMeenakshi = await User.create({
      name: 'Meenakshi Iyer',
      email: 'meenakshi.iyer@rentwise.in',
      password: landlordPass,
      role: 'landlord',
      phone: '+91 98401 77234',
      isActive: true,
    });

    const landlordHarpreet = await User.create({
      name: 'Harpreet Singh Gill',
      email: 'harpreet.gill@rentwise.in',
      password: landlordPass,
      role: 'landlord',
      phone: '+91 98112 63900',
      isActive: true,
    });

    const landlordAnanya = await User.create({
      name: 'Ananya Chatterjee',
      email: 'ananya.chatterjee@rentwise.in',
      password: landlordPass,
      role: 'landlord',
      phone: '+91 98300 54128',
      isActive: true,
    });

    // 3. Tenants (10: 8 assigned + 2 available for immediate lease testing)
    const tenantAarav = await User.create({
      name: 'Aarav Sharma',
      email: 'tenant@rentwise.in',
      password: tenantPass,
      role: 'tenant',
      phone: '+91 98765 43210',
      emergencyContact: 'Sunita Sharma (+91 98765 11002)',
      isActive: true,
    });

    const tenantPriya = await User.create({
      name: 'Priya Nair',
      email: 'priya.nair@gmail.com',
      password: tenantPass,
      role: 'tenant',
      phone: '+91 97402 88123',
      emergencyContact: 'Ramesh Nair (+91 94471 22310)',
      isActive: true,
    });

    const tenantRohan = await User.create({
      name: 'Rohan Verma',
      email: 'rohan.verma@outlook.com',
      password: tenantPass,
      role: 'tenant',
      phone: '+91 98109 34512',
      emergencyContact: 'Alok Verma (+91 98109 99812)',
      isActive: true,
    });

    const tenantSneha = await User.create({
      name: 'Sneha Patil',
      email: 'sneha.patil@gmail.com',
      password: tenantPass,
      role: 'tenant',
      phone: '+91 97654 21098',
      emergencyContact: 'Prakash Patil (+91 98220 44129)',
      isActive: true,
    });

    const tenantKarthik = await User.create({
      name: 'Karthik Subramanian',
      email: 'karthik.s@gmail.com',
      password: tenantPass,
      role: 'tenant',
      phone: '+91 98450 61239',
      emergencyContact: 'Lakshmi S (+91 98450 11890)',
      isActive: true,
    });

    const tenantNeha = await User.create({
      name: 'Neha Agarwal',
      email: 'neha.agarwal@yahoo.in',
      password: tenantPass,
      role: 'tenant',
      phone: '+91 98204 51982',
      emergencyContact: 'Vivek Agarwal (+91 98204 11200)',
      isActive: true,
    });

    const tenantSiddharth = await User.create({
      name: 'Siddharth Joshi',
      email: 'siddharth.joshi@gmail.com',
      password: tenantPass,
      role: 'tenant',
      phone: '+91 99210 77814',
      emergencyContact: 'Milind Joshi (+91 98223 11402)',
      isActive: true,
    });

    const tenantDivya = await User.create({
      name: 'Divya Menon',
      email: 'divya.menon@gmail.com',
      password: tenantPass,
      role: 'tenant',
      phone: '+91 98470 33219',
      emergencyContact: 'Gopal Menon (+91 98470 11220)',
      isActive: true,
    });

    // Unassigned tenants ready to be assigned to vacant flats
    await User.create({
      name: 'Arjun Malhotra',
      email: 'arjun.malhotra@gmail.com',
      password: tenantPass,
      role: 'tenant',
      phone: '+91 98180 44291',
      emergencyContact: 'Karan Malhotra (+91 98180 22100)',
      isActive: true,
    });

    await User.create({
      name: 'Kavita Reddy',
      email: 'kavita.reddy@gmail.com',
      password: tenantPass,
      role: 'tenant',
      phone: '+91 90001 66542',
      emergencyContact: 'Srinivas Reddy (+91 98480 44510)',
      isActive: true,
    });

    // 4. Properties (7 across Indian cities)
    const propShanti = await Property.create({
      landlord: landlordVikram._id,
      name: 'Shanti Niketan Residency',
      address: 'Plot 18, Paud Road, Kothrud',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '411038',
      propertyType: 'apartment',
      description: 'Well-ventilated 2BHK and 3BHK society flats near Kothrud Metro station with 24x7 corporation water and power backup.',
      amenities: ['24x7 Power Backup', 'Covered Parking', 'Lift', 'CCTV Security', 'RO Water Supply', 'Rainwater Harvesting'],
      images: [
        '/assets/images/indian_residency_hero_1795086777363.jpg',
        '/assets/images/mumbai_living_interior_1795086776293.jpg',
      ],
    });

    const propIndiranagar = await Property.create({
      landlord: landlordVikram._id,
      name: 'Indiranagar Courtyard Homes',
      address: 'No. 42, 12th Main, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560038',
      propertyType: 'condo',
      description: 'Boutique low-rise apartments with teak louvered balconies, dedicated work-from-home nooks, and walking distance to Indiranagar Metro.',
      amenities: ['High-speed Fiber WiFi', 'Stilt Parking', 'Power Backup', 'Security Guard', 'Intercom', 'Terrace Garden'],
      images: [
        '/assets/images/bengaluru_courtyard_homes_1795086774452.jpg',
      ],
    });

    const propBandra = await Property.create({
      landlord: landlordVikram._id,
      name: 'Pali Crest Apartments',
      address: '14th Road, Pali Hill, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400050',
      propertyType: 'apartment',
      description: 'Sea-breeze facing residences in Bandra West with marble flooring, modular kitchens, and dedicated servant utility access.',
      amenities: ['Lift', 'Covered Parking', 'Piped PNG Gas', 'CCTV Security', 'Intercom'],
      images: [
        '/assets/images/mumbai_living_interior_1795086776293.jpg',
      ],
    });

    const propBaner = await Property.create({
      landlord: landlordVikram._id,
      name: 'Baner Parkview Heights',
      address: 'Survey 112, Baner-Pashan Link Road',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '411045',
      propertyType: 'apartment',
      description: 'Family-friendly residential wing close to Hinjewadi IT Park with landscaped podium and children play area.',
      amenities: ['Clubhouse', 'Gym', 'Covered Parking', '24x7 Security', 'Solar Water Heater'],
      images: [
        '/assets/images/indian_residency_hero_1795086777363.jpg',
      ],
    });

    const propAdyar = await Property.create({
      landlord: landlordMeenakshi._id,
      name: 'Adyar Banyan Enclave',
      address: '2nd Crescent Park Road, Gandhi Nagar, Adyar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600020',
      propertyType: 'apartment',
      description: 'Peaceful tree-lined flats in Gandhi Nagar with Vaastu-compliant layouts and metro water connection.',
      amenities: ['Lift', 'Power Backup', 'Covered Parking', 'Rainwater Harvesting', 'CCTV Security'],
      images: [
        '/assets/images/bengaluru_courtyard_homes_1795086774452.jpg',
      ],
    });

    const propGurugram = await Property.create({
      landlord: landlordHarpreet._id,
      name: 'DLF Phase 4 Golf View Floors',
      address: 'Block C, Sector 28, DLF Phase 4',
      city: 'Gurugram',
      state: 'Haryana',
      zipCode: '122002',
      propertyType: 'house',
      description: 'Independent builder floors near Galleria Market with private lift lobby, stilt parking, and full DG backup.',
      amenities: ['100% DG Backup', 'Private Lift', 'Stilt Parking', 'Piped Gas', 'Modular Kitchen'],
      images: [
        '/assets/images/mumbai_living_interior_1795086776293.jpg',
      ],
    });

    const propHyderabad = await Property.create({
      landlord: landlordAnanya._id,
      name: 'Jubilee Hills Terraces',
      address: 'Plot 214, Road No. 36, Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500033',
      propertyType: 'condo',
      description: 'Spacious 3BHK flats overlooking KBR Park greenery with quick connectivity to HITEC City.',
      amenities: ['24x7 Security', 'Gym', 'Covered Parking', 'Power Backup', 'RO Water Supply'],
      images: [
        '/assets/images/indian_residency_hero_1795086777363.jpg',
      ],
    });

    // 5. Rooms / Flats (15 units across properties)
    // Shanti Niketan (Pune) - 4 flats
    const flatA101 = await Room.create({
      property: propShanti._id,
      landlord: landlordVikram._id,
      roomNumber: 'A-101',
      floor: 1,
      rentAmount: 24000,
      depositAmount: 75000,
      facilities: ['2BHK', 'Modular Kitchen', 'Geyser', 'Balcony', 'Covered Parking'],
      status: 'occupied',
      description: 'East-facing 2BHK with garden view balcony and dry utility area.',
    });

    const flatA204 = await Room.create({
      property: propShanti._id,
      landlord: landlordVikram._id,
      roomNumber: 'A-204',
      floor: 2,
      rentAmount: 28000,
      depositAmount: 85000,
      facilities: ['2BHK', 'Split AC', 'Modular Kitchen', 'RO Purifier', 'Inverter'],
      status: 'occupied',
      description: 'Corner semi-furnished 2BHK with wardrobes and AC in master bedroom.',
    });

    const flatB302 = await Room.create({
      property: propShanti._id,
      landlord: landlordVikram._id,
      roomNumber: 'B-302',
      floor: 3,
      rentAmount: 32000,
      depositAmount: 100000,
      facilities: ['3BHK', '2 Balconies', 'Solar Geyser', 'Piped Gas'],
      status: 'vacant',
      description: 'Freshly painted 3BHK ready for immediate family or working-professional possession.',
    });

    const flatB305 = await Room.create({
      property: propShanti._id,
      landlord: landlordVikram._id,
      roomNumber: 'B-305',
      floor: 3,
      rentAmount: 22500,
      depositAmount: 65000,
      facilities: ['2BHK', 'Geyser', 'Wardrobes'],
      status: 'maintenance',
      description: 'Bathroom tile grouting and interior repainting in progress.',
    });

    // Indiranagar Courtyard (Bengaluru) - 3 flats
    const flatI102 = await Room.create({
      property: propIndiranagar._id,
      landlord: landlordVikram._id,
      roomNumber: 'C-102',
      floor: 1,
      rentAmount: 36000,
      depositAmount: 150000,
      facilities: ['2BHK', 'Teak Balcony', 'Split AC', 'Work Desk', 'Power Backup'],
      status: 'occupied',
      description: 'Quiet courtyard-facing flat ideal for tech professionals.',
    });

    const flatI201 = await Room.create({
      property: propIndiranagar._id,
      landlord: landlordVikram._id,
      roomNumber: 'C-201',
      floor: 2,
      rentAmount: 38500,
      depositAmount: 150000,
      facilities: ['2BHK', 'Fully Furnished', 'Washing Machine', 'Split AC'],
      status: 'occupied',
      description: 'Bright second-floor residence with teakwood furniture.',
    });

    const flatI301 = await Room.create({
      property: propIndiranagar._id,
      landlord: landlordVikram._id,
      roomNumber: 'C-301',
      floor: 3,
      rentAmount: 42000,
      depositAmount: 180000,
      facilities: ['3BHK', 'Terrace Access', 'Modular Kitchen', '2 Car Parking'],
      status: 'vacant',
      description: 'Top floor 3BHK with private sit-out and open sky view.',
    });

    // Pali Crest (Mumbai) - 2 flats
    const flatM401 = await Room.create({
      property: propBandra._id,
      landlord: landlordVikram._id,
      roomNumber: '401',
      floor: 4,
      rentAmount: 65000,
      depositAmount: 200000,
      facilities: ['2BHK', 'Italian Marble', '2 Split ACs', 'Piped PNG Gas'],
      status: 'occupied',
      description: 'Cross-ventilated 2BHK with wide balcony and natural light.',
    });

    const flatM502 = await Room.create({
      property: propBandra._id,
      landlord: landlordVikram._id,
      roomNumber: '502',
      floor: 5,
      rentAmount: 72000,
      depositAmount: 250000,
      facilities: ['2BHK', 'Sea Breeze Balcony', 'Modular Kitchen', 'Stilt Parking'],
      status: 'vacant',
      description: 'High-floor renovated apartment available from next month.',
    });

    // Baner Parkview (Pune) - 2 flats
    const flatP202 = await Room.create({
      property: propBaner._id,
      landlord: landlordVikram._id,
      roomNumber: 'D-202',
      floor: 2,
      rentAmount: 21000,
      depositAmount: 60000,
      facilities: ['2BHK', 'Dry Balcony', 'Solar Water', 'Covered Parking'],
      status: 'occupied',
      description: 'Neat 2BHK facing central society garden.',
    });

    const flatP404 = await Room.create({
      property: propBaner._id,
      landlord: landlordVikram._id,
      roomNumber: 'D-404',
      floor: 4,
      rentAmount: 19500,
      depositAmount: 50000,
      facilities: ['1BHK', 'Balcony', 'Geyser'],
      status: 'vacant',
      description: 'Compact 1BHK suitable for single occupant or couple.',
    });

    // Adyar Banyan (Chennai - Meenakshi)
    const flatCh101 = await Room.create({
      property: propAdyar._id,
      landlord: landlordMeenakshi._id,
      roomNumber: 'G-1',
      floor: 1,
      rentAmount: 31000,
      depositAmount: 120000,
      facilities: ['2BHK', 'AC', 'Geyser', 'Covered Parking'],
      status: 'occupied',
      description: 'Spacious ground-plus-one flat with puja room.',
    });

    const flatCh202 = await Room.create({
      property: propAdyar._id,
      landlord: landlordMeenakshi._id,
      roomNumber: 'F-2',
      floor: 2,
      rentAmount: 34000,
      depositAmount: 120000,
      facilities: ['3BHK', 'Balcony', 'Modular Kitchen'],
      status: 'vacant',
      description: 'Airy 3BHK facing banyan avenue.',
    });

    // DLF Phase 4 (Gurugram - Harpreet)
    const flatGg2 = await Room.create({
      property: propGurugram._id,
      landlord: landlordHarpreet._id,
      roomNumber: '2nd-Floor',
      floor: 2,
      rentAmount: 55000,
      depositAmount: 110000,
      facilities: ['3BHK Builder Floor', 'Lift', '100% DG Backup', '2 Parking'],
      status: 'occupied',
      description: 'Premium builder floor with Italian marble and modular wardrobes.',
    });

    // Jubilee Hills (Hyderabad - Ananya)
    const flatHy303 = await Room.create({
      property: propHyderabad._id,
      landlord: landlordAnanya._id,
      roomNumber: '303',
      floor: 3,
      rentAmount: 44000,
      depositAmount: 100000,
      facilities: ['3BHK', 'Park View', 'Split AC', 'Power Backup'],
      status: 'vacant',
      description: 'East-facing 3BHK available for immediate move-in.',
    });

    // 6. Tenant Leases (8 active + 1 past terminated)
    // Primary Demo Tenant: Aarav Sharma in Shanti Niketan A-204 (Vikram)
    const leaseAarav = await TenantAssignment.create({
      property: propShanti._id,
      room: flatA204._id,
      tenant: tenantAarav._id,
      landlord: landlordVikram._id,
      leaseStart: new Date('2026-01-01'),
      leaseEnd: new Date('2026-11-30'),
      rentDueDate: 5,
      monthlyRent: 28000,
      depositPaid: 85000,
      status: 'active',
      notes: '11-month Leave & License registered agreement. Police verification completed.',
    });

    const leaseSneha = await TenantAssignment.create({
      property: propShanti._id,
      room: flatA101._id,
      tenant: tenantSneha._id,
      landlord: landlordVikram._id,
      leaseStart: new Date('2026-02-01'),
      leaseEnd: new Date('2026-12-31'),
      rentDueDate: 5,
      monthlyRent: 24000,
      depositPaid: 75000,
      status: 'active',
      notes: '11-month agreement. Society maintenance included in rent.',
    });

    const leasePriya = await TenantAssignment.create({
      property: propIndiranagar._id,
      room: flatI102._id,
      tenant: tenantPriya._id,
      landlord: landlordVikram._id,
      leaseStart: new Date('2026-03-01'),
      leaseEnd: new Date('2027-01-31'),
      rentDueDate: 1,
      monthlyRent: 36000,
      depositPaid: 150000,
      status: 'active',
      notes: 'Annual 5% escalation clause on renewal.',
    });

    const leaseKarthik = await TenantAssignment.create({
      property: propIndiranagar._id,
      room: flatI201._id,
      tenant: tenantKarthik._id,
      landlord: landlordVikram._id,
      leaseStart: new Date('2026-04-01'),
      leaseEnd: new Date('2027-02-28'),
      rentDueDate: 5,
      monthlyRent: 38500,
      depositPaid: 150000,
      status: 'active',
      notes: 'Company-leased accommodation with monthly GST receipt.',
    });

    const leaseNeha = await TenantAssignment.create({
      property: propBandra._id,
      room: flatM401._id,
      tenant: tenantNeha._id,
      landlord: landlordVikram._id,
      leaseStart: new Date('2026-01-15'),
      leaseEnd: new Date('2026-12-14'),
      rentDueDate: 5,
      monthlyRent: 65000,
      depositPaid: 200000,
      status: 'active',
      notes: 'Registered Maharashtra Leave & License.',
    });

    const leaseSiddharth = await TenantAssignment.create({
      property: propBaner._id,
      room: flatP202._id,
      tenant: tenantSiddharth._id,
      landlord: landlordVikram._id,
      leaseStart: new Date('2026-05-01'),
      leaseEnd: new Date('2027-03-31'),
      rentDueDate: 5,
      monthlyRent: 21000,
      depositPaid: 60000,
      status: 'active',
      notes: 'Standard 11-month agreement with 1 month notice period.',
    });

    // Leases for other landlords
    const leaseDivya = await TenantAssignment.create({
      property: propAdyar._id,
      room: flatCh101._id,
      tenant: tenantDivya._id,
      landlord: landlordMeenakshi._id,
      leaseStart: new Date('2026-02-01'),
      leaseEnd: new Date('2026-12-31'),
      rentDueDate: 5,
      monthlyRent: 31000,
      depositPaid: 120000,
      status: 'active',
      notes: 'Registered rental agreement.',
    });

    const leaseRohan = await TenantAssignment.create({
      property: propGurugram._id,
      room: flatGg2._id,
      tenant: tenantRohan._id,
      landlord: landlordHarpreet._id,
      leaseStart: new Date('2026-03-01'),
      leaseEnd: new Date('2027-01-31'),
      rentDueDate: 7,
      monthlyRent: 55000,
      depositPaid: 110000,
      status: 'active',
      notes: 'Includes 2 stilt parking slots.',
    });

    // Historical terminated lease so history tab has data
    await TenantAssignment.create({
      property: propShanti._id,
      room: flatB302._id,
      tenant: tenantSiddharth._id,
      landlord: landlordVikram._id,
      leaseStart: new Date('2025-05-01'),
      leaseEnd: new Date('2026-03-31'),
      rentDueDate: 5,
      monthlyRent: 30000,
      depositPaid: 90000,
      status: 'terminated',
      notes: 'Tenant relocated to Baner Parkview Heights. Full security deposit refunded.',
    });

    // 7. Rent Records & Payments across last 4 months + current month
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();

    const getMonthYear = (offset) => {
      const d = new Date(curYear, curMonth - 1 - offset, 1);
      return { month: d.getMonth() + 1, year: d.getFullYear() };
    };

    const vikramLeases = [
      { lease: leaseAarav, tenant: tenantAarav, prop: propShanti, room: flatA204, method: 'upi', refPrefix: 'UPI' },
      { lease: leaseSneha, tenant: tenantSneha, prop: propShanti, room: flatA101, method: 'neft_imps', refPrefix: 'IMPS' },
      { lease: leasePriya, tenant: tenantPriya, prop: propIndiranagar, room: flatI102, method: 'upi', refPrefix: 'UPI' },
      { lease: leaseKarthik, tenant: tenantKarthik, prop: propIndiranagar, room: flatI201, method: 'bank_transfer', refPrefix: 'NEFT' },
      { lease: leaseNeha, tenant: tenantNeha, prop: propBandra, room: flatM401, method: 'cheque', refPrefix: 'CHQ' },
      { lease: leaseSiddharth, tenant: tenantSiddharth, prop: propBaner, room: flatP202, method: 'upi', refPrefix: 'UPI' },
    ];

    // Past 3 months: fully settled for chart history
    for (let offset = 3; offset >= 1; offset--) {
      const { month, year } = getMonthYear(offset);
      for (let i = 0; i < vikramLeases.length; i++) {
        const item = vikramLeases[i];
        const due = new Date(year, month - 1, item.lease.rentDueDate || 5);
        const rec = await RentRecord.create({
          assignment: item.lease._id,
          tenant: item.tenant._id,
          property: item.prop._id,
          room: item.room._id,
          landlord: landlordVikram._id,
          month,
          year,
          dueDate: due,
          rentAmount: item.lease.monthlyRent,
          amountPaid: item.lease.monthlyRent,
          balanceDue: 0,
          status: 'paid',
          notes: `Rent settled for ${month}/${year}`,
        });

        await Payment.create({
          rentRecord: rec._id,
          assignment: item.lease._id,
          tenant: item.tenant._id,
          landlord: landlordVikram._id,
          property: item.prop._id,
          room: item.room._id,
          amount: item.lease.monthlyRent,
          paymentMethod: item.method,
          paymentDate: new Date(year, month - 1, Math.max(1, (item.lease.rentDueDate || 5) - 1)),
          referenceNumber: `${item.refPrefix}-${year}${String(month).padStart(2, '0')}${10 + i}`,
          notes: 'Verified by landlord',
          recordedBy: landlordVikram._id,
        });
      }
    }

    // Current Month for Vikram's tenants (realistic mix: paid, partial, unpaid/overdue)
    // Aarav: Partially paid ₹20,000, ₹8,000 pending
    const rentAaravCur = await RentRecord.create({
      assignment: leaseAarav._id,
      tenant: tenantAarav._id,
      property: propShanti._id,
      room: flatA204._id,
      landlord: landlordVikram._id,
      month: curMonth,
      year: curYear,
      dueDate: new Date(curYear, curMonth - 1, 5),
      rentAmount: 28000,
      amountPaid: 20000,
      balanceDue: 8000,
      status: 'partially_paid',
      notes: 'Part payment via UPI received; balance ₹8,000 due this week.',
    });
    await Payment.create({
      rentRecord: rentAaravCur._id,
      assignment: leaseAarav._id,
      tenant: tenantAarav._id,
      landlord: landlordVikram._id,
      property: propShanti._id,
      room: flatA204._id,
      amount: 20000,
      paymentMethod: 'upi',
      paymentDate: new Date(curYear, curMonth - 1, 4),
      referenceNumber: 'UPI-40928174',
      notes: 'First UPI transfer confirmed on GPay',
      recordedBy: landlordVikram._id,
    });

    // Sneha: Paid in full
    const rentSnehaCur = await RentRecord.create({
      assignment: leaseSneha._id,
      tenant: tenantSneha._id,
      property: propShanti._id,
      room: flatA101._id,
      landlord: landlordVikram._id,
      month: curMonth,
      year: curYear,
      dueDate: new Date(curYear, curMonth - 1, 5),
      rentAmount: 24000,
      amountPaid: 24000,
      balanceDue: 0,
      status: 'paid',
      notes: 'Cleared on time via IMPS',
    });
    await Payment.create({
      rentRecord: rentSnehaCur._id,
      assignment: leaseSneha._id,
      tenant: tenantSneha._id,
      landlord: landlordVikram._id,
      property: propShanti._id,
      room: flatA101._id,
      amount: 24000,
      paymentMethod: 'neft_imps',
      paymentDate: new Date(curYear, curMonth - 1, 3),
      referenceNumber: 'IMPS-551920',
      notes: 'HDFC IMPS credit verified',
      recordedBy: landlordVikram._id,
    });

    // Priya: Paid in full
    const rentPriyaCur = await RentRecord.create({
      assignment: leasePriya._id,
      tenant: tenantPriya._id,
      property: propIndiranagar._id,
      room: flatI102._id,
      landlord: landlordVikram._id,
      month: curMonth,
      year: curYear,
      dueDate: new Date(curYear, curMonth - 1, 1),
      rentAmount: 36000,
      amountPaid: 36000,
      balanceDue: 0,
      status: 'paid',
      notes: 'Full payment via UPI',
    });
    await Payment.create({
      rentRecord: rentPriyaCur._id,
      assignment: leasePriya._id,
      tenant: tenantPriya._id,
      landlord: landlordVikram._id,
      property: propIndiranagar._id,
      room: flatI102._id,
      amount: 36000,
      paymentMethod: 'upi',
      paymentDate: new Date(curYear, curMonth - 1, 1),
      referenceNumber: 'UPI-61829301',
      notes: 'PhonePe transfer confirmed',
      recordedBy: landlordVikram._id,
    });

    // Karthik: Paid in full
    const rentKarthikCur = await RentRecord.create({
      assignment: leaseKarthik._id,
      tenant: tenantKarthik._id,
      property: propIndiranagar._id,
      room: flatI201._id,
      landlord: landlordVikram._id,
      month: curMonth,
      year: curYear,
      dueDate: new Date(curYear, curMonth - 1, 5),
      rentAmount: 38500,
      amountPaid: 38500,
      balanceDue: 0,
      status: 'paid',
      notes: 'Corporate NEFT cleared',
    });
    await Payment.create({
      rentRecord: rentKarthikCur._id,
      assignment: leaseKarthik._id,
      tenant: tenantKarthik._id,
      landlord: landlordVikram._id,
      property: propIndiranagar._id,
      room: flatI201._id,
      amount: 38500,
      paymentMethod: 'bank_transfer',
      paymentDate: new Date(curYear, curMonth - 1, 4),
      referenceNumber: 'NEFT-882104',
      notes: 'ICICI NEFT confirmed',
      recordedBy: landlordVikram._id,
    });

    // Neha: Unpaid / Overdue
    await RentRecord.create({
      assignment: leaseNeha._id,
      tenant: tenantNeha._id,
      property: propBandra._id,
      room: flatM401._id,
      landlord: landlordVikram._id,
      month: curMonth,
      year: curYear,
      dueDate: new Date(curYear, curMonth - 1, 5),
      rentAmount: 65000,
      amountPaid: 0,
      balanceDue: 65000,
      status: 'unpaid',
      notes: 'Cheque awaited for current month',
    });

    // Siddharth: Unpaid
    await RentRecord.create({
      assignment: leaseSiddharth._id,
      tenant: tenantSiddharth._id,
      property: propBaner._id,
      room: flatP202._id,
      landlord: landlordVikram._id,
      month: curMonth,
      year: curYear,
      dueDate: new Date(curYear, curMonth - 1, 5),
      rentAmount: 21000,
      amountPaid: 0,
      balanceDue: 21000,
      status: 'unpaid',
      notes: 'Reminder sent on WhatsApp',
    });

    // Other landlords current month rent & payments
    const rentDivyaCur = await RentRecord.create({
      assignment: leaseDivya._id,
      tenant: tenantDivya._id,
      property: propAdyar._id,
      room: flatCh101._id,
      landlord: landlordMeenakshi._id,
      month: curMonth,
      year: curYear,
      dueDate: new Date(curYear, curMonth - 1, 5),
      rentAmount: 31000,
      amountPaid: 31000,
      balanceDue: 0,
      status: 'paid',
      notes: 'UPI settled',
    });
    await Payment.create({
      rentRecord: rentDivyaCur._id,
      assignment: leaseDivya._id,
      tenant: tenantDivya._id,
      landlord: landlordMeenakshi._id,
      property: propAdyar._id,
      room: flatCh101._id,
      amount: 31000,
      paymentMethod: 'upi',
      paymentDate: new Date(curYear, curMonth - 1, 2),
      referenceNumber: 'UPI-77312900',
      notes: 'Cleared on time',
      recordedBy: landlordMeenakshi._id,
    });

    const rentRohanCur = await RentRecord.create({
      assignment: leaseRohan._id,
      tenant: tenantRohan._id,
      property: propGurugram._id,
      room: flatGg2._id,
      landlord: landlordHarpreet._id,
      month: curMonth,
      year: curYear,
      dueDate: new Date(curYear, curMonth - 1, 7),
      rentAmount: 55000,
      amountPaid: 55000,
      balanceDue: 0,
      status: 'paid',
      notes: 'NEFT cleared',
    });
    await Payment.create({
      rentRecord: rentRohanCur._id,
      assignment: leaseRohan._id,
      tenant: tenantRohan._id,
      landlord: landlordHarpreet._id,
      property: propGurugram._id,
      room: flatGg2._id,
      amount: 55000,
      paymentMethod: 'neft_imps',
      paymentDate: new Date(curYear, curMonth - 1, 6),
      referenceNumber: 'NEFT-330918',
      notes: 'SBI transfer received',
      recordedBy: landlordHarpreet._id,
    });

    // 8. Maintenance Complaints (10 realistic Indian household tickets)
    await Complaint.create({
      tenant: tenantAarav._id,
      landlord: landlordVikram._id,
      property: propShanti._id,
      room: flatA204._id,
      title: 'Bathroom geyser thermostat tripping MCB',
      description: 'Whenever the Racold geyser in the master bathroom runs for more than 5 minutes, the bathroom MCB trips automatically.',
      category: 'electrical',
      priority: 'high',
      status: 'in_progress',
      resolutionNotes: 'Society electrician Ramesh scheduled to replace heating coil and thermostat tomorrow at 11 AM.',
    });

    await Complaint.create({
      tenant: tenantAarav._id,
      landlord: landlordVikram._id,
      property: propShanti._id,
      room: flatA204._id,
      title: 'RO water purifier membrane leakage',
      description: 'Slow water dripping from the bottom casing of the kitchen Kent RO unit.',
      category: 'plumbing',
      priority: 'medium',
      status: 'open',
    });

    await Complaint.create({
      tenant: tenantAarav._id,
      landlord: landlordVikram._id,
      property: propShanti._id,
      room: flatA204._id,
      title: 'Main door Godrej night latch alignment',
      description: 'Latch bolt was rubbing against the door frame and hard to lock from outside.',
      category: 'carpentry',
      priority: 'low',
      status: 'resolved',
      resolutionNotes: 'Carpenter filed striker plate and oiled lock cylinder. Working smoothly now.',
      resolvedAt: new Date(curYear, curMonth - 1, 3),
    });

    await Complaint.create({
      tenant: tenantSneha._id,
      landlord: landlordVikram._id,
      property: propShanti._id,
      room: flatA101._id,
      title: 'Balcony pigeon net loose on left corner',
      description: 'Heavy wind tore two hooks of the anti-bird net in the utility balcony.',
      category: 'other',
      priority: 'low',
      status: 'open',
    });

    await Complaint.create({
      tenant: tenantPriya._id,
      landlord: landlordVikram._id,
      property: propIndiranagar._id,
      room: flatI102._id,
      title: 'Split AC cooling low in master bedroom',
      description: 'AC indoor unit is running but air is not cooling below 26°C. Looks like gas top-up or jet cleaning is required.',
      category: 'appliance',
      priority: 'high',
      status: 'in_progress',
      resolutionNotes: 'Urban Company AC technician booked for Friday afternoon.',
    });

    await Complaint.create({
      tenant: tenantKarthik._id,
      landlord: landlordVikram._id,
      property: propIndiranagar._id,
      room: flatI201._id,
      title: 'Inverter backup dropping during power cut',
      description: 'During yesterday evening BESCOM outage, inverter lasted only 15 minutes before low-battery beep.',
      category: 'electrical',
      priority: 'medium',
      status: 'open',
    });

    await Complaint.create({
      tenant: tenantNeha._id,
      landlord: landlordVikram._id,
      property: propBandra._id,
      room: flatM401._id,
      title: 'Kitchen sink drainage slow and backing up',
      description: 'Water accumulates in the stainless steel sink during dishwashing and drains very slowly.',
      category: 'plumbing',
      priority: 'urgent',
      status: 'open',
    });

    await Complaint.create({
      tenant: tenantSiddharth._id,
      landlord: landlordVikram._id,
      property: propBaner._id,
      room: flatP202._id,
      title: 'Intercom handset not ringing from main gate',
      description: 'Security guard calls from gate do not ring inside the flat; dial tone is dead.',
      category: 'electrical',
      priority: 'low',
      status: 'resolved',
      resolutionNotes: 'Replaced RJ11 wall jack and tested call with main gate cabin.',
      resolvedAt: new Date(curYear, curMonth - 1, 2),
    });

    await Complaint.create({
      tenant: tenantDivya._id,
      landlord: landlordMeenakshi._id,
      property: propAdyar._id,
      room: flatCh101._id,
      title: 'Minor wall seepage near guest bathroom shaft',
      description: 'Paint blistering observed on the common wall adjacent to the plumbing shaft.',
      category: 'plumbing',
      priority: 'medium',
      status: 'in_progress',
      resolutionNotes: 'Plumber inspected overhead pipe joint; waterproof grouting scheduled.',
    });

    await Complaint.create({
      tenant: tenantRohan._id,
      landlord: landlordHarpreet._id,
      property: propGurugram._id,
      room: flatGg2._id,
      title: 'Kitchen chimney exhaust making rattling noise',
      description: 'Chimney suction fan vibrates loudly on speed 2 and 3.',
      category: 'appliance',
      priority: 'medium',
      status: 'open',
    });

    console.log('[Seed] RentWise seeded with 1 Admin, 4 Landlords, 10 Tenants, 7 Properties, 15 Flats, 9 Leases & 10 Maintenance Tickets.');
    console.log(`[Seed] Demo logins -> admin: ${config.initialAdmin.email.toLowerCase()} / ${config.initialAdmin.password} | landlord: landlord@rentwise.in / Landlord@123 | tenant: tenant@rentwise.in / Tenant@123`);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
  }
}
