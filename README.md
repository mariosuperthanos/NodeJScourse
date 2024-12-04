# Let's correct the syntax and generate the markdown file correctly.

readme_content_code_only = """
# Tour Management API

## Descriere

Acest API permite gestionarea tururilor, incluzând operațiuni precum obținerea tururilor, adăugarea de tururi noi, actualizarea și ștergerea tururilor existente. De asemenea, API-ul oferă statistici și un plan lunar bazat pe datele despre tururi.

## CRUD Operations

Acest API implementază operațiile CRUD (Create, Read, Update, Delete) pentru gestionarea tururilor.

### 1. **Create (POST /tours)**

Permite adăugarea unui tur nou în baza de date.

#### Cod:
```javascript
exports.createTour = async (req, res) => {
  try {
    console.log(req.body);
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};
