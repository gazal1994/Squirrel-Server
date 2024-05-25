// Import necessary modules and setup Express server
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import connectToDatabase from './database';


const app: Application = express();

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(express.json());

// Get all users endpoint
app.get('/api/users', async (req: Request, res: Response) => {
    try {
        const connection = await connectToDatabase();
        const rows = (await connection.execute('SELECT * FROM users'))[0] as any[];

        const users: User[] = rows.map(row => ({
            id:row.id,
            gender: row.gender,
            name: {
                title: row.name_title,
                first: row.name_first,
                last: row.name_last
            },
            location: {
                street: {
                    number: row.location_street_number,
                    name: row.location_street_name
                },
                city: row.location_city,
                state: row.location_state,
                country: row.location_country,
                postcode: row.location_postcode,
                coordinates: {
                    latitude: row.location_coordinates_latitude,
                    longitude: row.location_coordinates_longitude
                },
                timezone: {
                    offset: row.location_timezone_offset,
                    description: row.location_timezone_description
                }
            },
            email: row.email,
            login: {
                uuid: row.login_uuid,
                username: row.login_username,
                password: row.login_password,
                salt: row.login_salt,
                md5: row.login_md5,
                sha1: row.login_sha1,
                sha256: row.login_sha256
            },
            dob: {
                date: new Date(row.dob_date),
                age: row.dob_age
            },
            registered: {
                date: new Date(row.registered_date),
                age: row.registered_age
            },
            phone: row.phone,
            cell: row.cell,
            id2: {
                name: row.id_name,
                value: row.id_value
            },
            picture: {
                large: row.picture_large,
                medium: row.picture_medium,
                thumbnail: row.picture_thumbnail
            },
            nat: row.nat
        }));

      //  return users;
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Logging middleware
app.use(morgan('dev')); // 'dev' format provides concise output

// Example data store (replace with your database implementation)
let users: { id: number; name: string; email: string }[] = [];

app.post('/api/save-user', async (req, res) => {
    const userData = req.body;

    // Check if userData is provided
    if (!userData || !userData.name || !userData.email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }

    try {
        const connection = await connectToDatabase();
        
        // Check if user already exists
        const [existingUser] = await connection.execute('SELECT * FROM users WHERE email = ?', [userData.email]);
        // if (existingUser.length > 0) {
        //     return res.status(400).json({ message: 'User already exists' });
        // }

        // Insert new user
        const query = `
            INSERT INTO users (
                gender, name_title, name_first, name_last,
                location_street_number, location_street_name, location_city, location_state, location_country, location_postcode,
                location_coordinates_latitude, location_coordinates_longitude, location_timezone_offset, location_timezone_description,
                email, login_uuid, login_username, login_password, login_salt, login_md5, login_sha1, login_sha256,
                dob_date, dob_age, registered_date, registered_age, phone, cell, id_name, id_value,
                picture_large, picture_medium, picture_thumbnail, nat
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            userData.gender, userData.name.title, userData.name.first, userData.name.last,
            userData.location.street.number, userData.location.street.name, userData.location.city, userData.location.state, userData.location.country, userData.location.postcode,
            userData.location.coordinates.latitude, userData.location.coordinates.longitude, userData.location.timezone.offset, userData.location.timezone.description,
            userData.email, userData.login.uuid, userData.login.username, userData.login.password, userData.login.salt, userData.login.md5, userData.login.sha1, userData.login.sha256,
            new Date(userData.dob.date), userData.dob.age, new Date(userData.registered.date), userData.registered.age, userData.phone, userData.cell, userData.id.name, userData.id.value,
            userData.picture.large, userData.picture.medium, userData.picture.thumbnail, userData.nat
        ];

        const [result] = await connection.execute(query, values);
        
        res.status(201).json({ id: result, ...userData });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user endpoint
// Update user endpoint
app.put('/api/update-user/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const userData = req.body;

    try {
        const connection = await connectToDatabase();
        const [existingUser] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);

        // Update user data
        const query = `
            UPDATE users
            SET 
                gender = ?, name_title = ?, name_first = ?, name_last = ?,
                location_street_number = ?, location_street_name = ?, location_city = ?, location_state = ?, location_country = ?, location_postcode = ?,
                location_coordinates_latitude = ?, location_coordinates_longitude = ?, location_timezone_offset = ?, location_timezone_description = ?,
                email = ?, login_uuid = ?, login_username = ?, login_password = ?, login_salt = ?, login_md5 = ?, login_sha1 = ?, login_sha256 = ?,
                dob_date = ?, dob_age = ?, registered_date = ?, registered_age = ?, phone = ?, cell = ?, id_name = ?, id_value = ?,
                picture_large = ?, picture_medium = ?, picture_thumbnail = ?, nat = ?
            WHERE id = ?
        `;

        // Build the values array ensuring all properties are defined
        const values = [
            userData.gender || '',
            userData.name?.title || '',
            userData.name?.first || '',
            userData.name?.last || '',
            userData.location?.street?.number || '',
            userData.location?.street?.name || '',
            userData.location?.city || '',
            userData.location?.state || '',
            userData.location?.country || '',
            userData.location?.postcode || '',
            userData.location?.coordinates?.latitude || '',
            userData.location?.coordinates?.longitude || '',
            userData.location?.timezone?.offset || '',
            userData.location?.timezone?.description || '',
            userData.email || '',
            userData.login?.uuid || '',
            userData.login?.username || '',
            userData.login?.password || '',
            userData.login?.salt || '',
            userData.login?.md5 || '',
            userData.login?.sha1 || '',
            userData.login?.sha256 || '',
            userData.dob?.date ? new Date(userData.dob.date) : '',
            userData.dob?.age || '',
            userData.registered?.date ? new Date(userData.registered.date) : '',
            userData.registered?.age || '',
            userData.phone || '',
            userData.cell || '',
            userData.id?.name || '',
            userData.id?.value || '',
            userData.picture?.large || '',
            userData.picture?.medium || '',
            userData.picture?.thumbnail || '',
            userData.nat || '',
            id
        ];

        await connection.execute(query, values);

        res.json({ id, ...userData });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Delete user endpoint
app.delete('/api/delete-user/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    try {
        const connection = await connectToDatabase();
        const [existingUser] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);

        // Delete user
        await connection.execute('DELETE FROM users WHERE id = ?', [id]);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Root Route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to your Express server!');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
