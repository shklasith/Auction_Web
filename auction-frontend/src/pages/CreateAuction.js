import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateAuction = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailedDescription: '',
    category: '',
    subCategory: '',
    condition: '',
    conditionNotes: '',
    startingPrice: '',
    buyNowPrice: '',
    reservePrice: '',
    startDate: '',
    endDate: '',
    type: 0,
    brand: '',
    model: '',
    size: '',
    color: '',
    material: '',
    yearManufactured: '',
    countryOfOrigin: '',
    shippingCost: '',
    freeShipping: false,
    localPickupOnly: false,
    shippingNotes: '',
    itemLocation: '',
    bidIncrement: '',
    autoExtend: false,
    autoExtendMinutes: '',
    requirePreApproval: false,
    maxBids: '',
    tags: '',
    externalReference: '',
    images: []
  });
  
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);

  const conditions = [
    'New', 'Like New', 'Excellent', 'Very Good', 'Good', 'Fair', 'Poor'
  ];

  const auctionTypes = [
    { value: 0, label: 'Standard Auction' },
    { value: 1, label: 'Reserve Auction' },
    { value: 2, label: 'Buy It Now' },
    { value: 3, label: 'Dutch Auction' }
  ];

  useEffect(() => {
    fetchCategories();
    setDefaultDates();
  }, []);

  useEffect(() => {
    if (formData.category) {
      fetchSubCategories(formData.category);
    }
  }, [formData.category]);

  const fetchCategories = async () => {
    try {
            const response = await axios.get('http://localhost:5104/api/auctions/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubCategories = async (category) => {
    try {
            const response = await axios.get(`http://localhost:5104/api/auctions/categories/${category}/subcategories`);
      setSubCategories(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubCategories([]);
    }
  };

  const setDefaultDates = () => {
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endDate = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000); // 8 days from now
    
    setFormData(prev => ({
      ...prev,
      startDate: startDate.toISOString().slice(0, 16),
      endDate: endDate.toISOString().slice(0, 16)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = type === 'checkbox' ? checked : value;
    
    // Convert type select to integer
    if (name === 'type') {
      processedValue = parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({
          file,
          preview: e.target.result,
          isPrimary: formData.images.length === 0 && files.indexOf(file) === 0
        });
        reader.readAsDataURL(file);
      });
    });

    const imageData = await Promise.all(imagePromises);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageData.map((img, index) => ({
        imageUrl: img.preview,
        altText: `${formData.title} - Image ${prev.images.length + index + 1}`,
        isPrimary: img.isPrimary,
        displayOrder: prev.images.length + index + 1,
        type: img.isPrimary ? 'Primary' : 'Gallery'
      }))]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
        type: i === index ? 'Primary' : 'Gallery'
      }))
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.condition) newErrors.condition = 'Condition is required';
    if (!formData.startingPrice || formData.startingPrice <= 0) newErrors.startingPrice = 'Valid starting price is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.buyNowPrice && formData.buyNowPrice <= formData.startingPrice) {
      newErrors.buyNowPrice = 'Buy now price must be higher than starting price';
    }

    if (formData.reservePrice && formData.reservePrice < formData.startingPrice) {
      newErrors.reservePrice = 'Reserve price must be at least the starting price';
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare the auction data
      const auctionData = {
        ...formData,
        type: parseInt(formData.type, 10),
        startingPrice: parseFloat(formData.startingPrice),
        buyNowPrice: formData.buyNowPrice ? parseFloat(formData.buyNowPrice) : null,
        reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : null,
        shippingCost: formData.shippingCost ? parseFloat(formData.shippingCost) : null,
        bidIncrement: formData.bidIncrement ? parseFloat(formData.bidIncrement) : null,
        autoExtendMinutes: formData.autoExtendMinutes ? parseInt(formData.autoExtendMinutes) : null,
        maxBids: formData.maxBids ? parseInt(formData.maxBids) : null,
        yearManufactured: formData.yearManufactured ? parseInt(formData.yearManufactured) : null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        sellerId: '1' // TODO: Replace with actual logged-in user ID
      };

            const response = await axios.post('http://localhost:5104/api/auctions', auctionData);
      
      if (response.status === 201) {
        setSuccess('Auction created successfully!');
        setTimeout(() => {
          navigate(`/auction/${response.data.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating auction:', error);
      if (error.response && error.response.data) {
        setErrors({ submit: error.response.data.message || 'Failed to create auction' });
      } else {
        setErrors({ submit: 'Failed to create auction. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card>
            <Card.Header>
              <h2>Create New Auction</h2>
            </Card.Header>
            <Card.Body>
              {success && <Alert variant="success">{success}</Alert>}
              {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <Row>
                  <Col md={12}>
                    <h5 className="mb-3">Basic Information</h5>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        isInvalid={!!errors.title}
                        placeholder="Enter auction title"
                        maxLength={200}
                      />
                      <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        isInvalid={!!errors.description}
                        placeholder="Brief description of the item"
                        maxLength={2000}
                      />
                      <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Detailed Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="detailedDescription"
                        value={formData.detailedDescription}
                        onChange={handleInputChange}
                        placeholder="Detailed description including condition notes, history, specifications, etc."
                        maxLength={5000}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Category and Condition */}
                <Row>
                  <Col md={12}>
                    <h5 className="mb-3">Category & Condition</h5>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        isInvalid={!!errors.category}
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sub Category</Form.Label>
                      <Form.Select
                        name="subCategory"
                        value={formData.subCategory}
                        onChange={handleInputChange}
                        disabled={!formData.category}
                      >
                        <option value="">Select sub category</option>
                        {subCategories.map(subCat => (
                          <option key={subCat} value={subCat}>{subCat}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Condition *</Form.Label>
                      <Form.Select
                        name="condition"
                        value={formData.condition}
                        onChange={handleInputChange}
                        isInvalid={!!errors.condition}
                      >
                        <option value="">Select condition</option>
                        {conditions.map(condition => (
                          <option key={condition} value={condition}>{condition}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.condition}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Condition Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="conditionNotes"
                        value={formData.conditionNotes}
                        onChange={handleInputChange}
                        placeholder="Additional condition details"
                        maxLength={1000}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Item Specifications */}
                <Row>
                  <Col md={12}>
                    <h5 className="mb-3">Item Specifications</h5>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Brand</Form.Label>
                      <Form.Control
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        placeholder="Brand name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Model</Form.Label>
                      <Form.Control
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        placeholder="Model number/name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Year Manufactured</Form.Label>
                      <Form.Control
                        type="number"
                        name="yearManufactured"
                        value={formData.yearManufactured}
                        onChange={handleInputChange}
                        placeholder="Year"
                        min="1800"
                        max={new Date().getFullYear()}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Size</Form.Label>
                      <Form.Control
                        type="text"
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        placeholder="Size/dimensions"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Color</Form.Label>
                      <Form.Control
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        placeholder="Primary color"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Material</Form.Label>
                      <Form.Control
                        type="text"
                        name="material"
                        value={formData.material}
                        onChange={handleInputChange}
                        placeholder="Primary material"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country of Origin</Form.Label>
                      <Form.Control
                        type="text"
                        name="countryOfOrigin"
                        value={formData.countryOfOrigin}
                        onChange={handleInputChange}
                        placeholder="Made in..."
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Pricing and Auction Settings */}
                <Row>
                  <Col md={12}>
                    <h5 className="mb-3">Pricing & Auction Settings</h5>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Auction Type</Form.Label>
                      <Form.Select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                      >
                        {auctionTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Starting Price * ($)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0.01"
                        name="startingPrice"
                        value={formData.startingPrice}
                        onChange={handleInputChange}
                        isInvalid={!!errors.startingPrice}
                        placeholder="0.00"
                      />
                      <Form.Control.Feedback type="invalid">{errors.startingPrice}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Buy Now Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0.01"
                        name="buyNowPrice"
                        value={formData.buyNowPrice}
                        onChange={handleInputChange}
                        isInvalid={!!errors.buyNowPrice}
                        placeholder="Optional"
                      />
                      <Form.Control.Feedback type="invalid">{errors.buyNowPrice}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reserve Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0.01"
                        name="reservePrice"
                        value={formData.reservePrice}
                        onChange={handleInputChange}
                        isInvalid={!!errors.reservePrice}
                        placeholder="Optional"
                      />
                      <Form.Control.Feedback type="invalid">{errors.reservePrice}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bid Increment ($)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0.01"
                        name="bidIncrement"
                        value={formData.bidIncrement}
                        onChange={handleInputChange}
                        placeholder="Auto calculated"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Scheduling */}
                <Row>
                  <Col md={12}>
                    <h5 className="mb-3">Scheduling</h5>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date & Time *</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        isInvalid={!!errors.startDate}
                      />
                      <Form.Control.Feedback type="invalid">{errors.startDate}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date & Time *</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        isInvalid={!!errors.endDate}
                      />
                      <Form.Control.Feedback type="invalid">{errors.endDate}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <div className="mb-3">
                      <Form.Check
                        type="checkbox"
                        name="autoExtend"
                        checked={formData.autoExtend}
                        onChange={handleInputChange}
                        label="Auto-extend auction if bid placed in final minutes"
                      />
                      {formData.autoExtend && (
                        <Form.Control
                          type="number"
                          name="autoExtendMinutes"
                          value={formData.autoExtendMinutes}
                          onChange={handleInputChange}
                          placeholder="Extension minutes"
                          min="1"
                          max="60"
                          className="mt-2"
                          style={{ width: '200px' }}
                        />
                      )}
                    </div>
                  </Col>
                </Row>

                {/* Shipping Information */}
                <Row>
                  <Col md={12}>
                    <h5 className="mb-3">Shipping & Location</h5>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Item Location</Form.Label>
                      <Form.Control
                        type="text"
                        name="itemLocation"
                        value={formData.itemLocation}
                        onChange={handleInputChange}
                        placeholder="City, State/Country"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Shipping Cost ($)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        name="shippingCost"
                        value={formData.shippingCost}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        disabled={formData.freeShipping || formData.localPickupOnly}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <div className="mb-3">
                      <Form.Check
                        type="checkbox"
                        name="freeShipping"
                        checked={formData.freeShipping}
                        onChange={handleInputChange}
                        label="Free shipping"
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        name="localPickupOnly"
                        checked={formData.localPickupOnly}
                        onChange={handleInputChange}
                        label="Local pickup only"
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Shipping Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="shippingNotes"
                        value={formData.shippingNotes}
                        onChange={handleInputChange}
                        placeholder="Special shipping instructions or policies"
                        maxLength={500}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Images */}
                <Row>
                  <Col md={12}>
                    <h5 className="mb-3">Images</h5>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Upload Images</Form.Label>
                      <Form.Control
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        isInvalid={!!errors.images}
                      />
                      <Form.Text className="text-muted">
                        Upload multiple images. First image will be set as primary.
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">{errors.images}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {formData.images.length > 0 && (
                  <Row>
                    <Col md={12}>
                      <div className="mb-3">
                        <h6>Image Preview</h6>
                        <div className="d-flex flex-wrap gap-3">
                          {formData.images.map((image, index) => (
                            <div key={index} className="position-relative" style={{ width: '150px' }}>
                              <img
                                src={image.imageUrl}
                                alt={image.altText}
                                className="img-thumbnail"
                                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                              />
                              {image.isPrimary && (
                                <Badge bg="primary" className="position-absolute top-0 start-0 m-1">
                                  Primary
                                </Badge>
                              )}
                              <div className="position-absolute top-0 end-0 m-1">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => removeImage(index)}
                                  style={{ padding: '2px 6px' }}
                                >
                                  ×
                                </Button>
                              </div>
                              {!image.isPrimary && (
                                <div className="position-absolute bottom-0 start-0 m-1">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => setPrimaryImage(index)}
                                  >
                                    Set Primary
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Col>
                  </Row>
                )}

                {/* Additional Settings */}
                <Row>
                  <Col md={12}>
                    <h5 className="mb-3">Additional Settings</h5>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tags</Form.Label>
                      <Form.Control
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="vintage,collectible,rare (comma separated)"
                        maxLength={500}
                      />
                      <Form.Text className="text-muted">
                        Comma-separated keywords to help buyers find your item
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>External Reference</Form.Label>
                      <Form.Control
                        type="text"
                        name="externalReference"
                        value={formData.externalReference}
                        onChange={handleInputChange}
                        placeholder="SKU, catalog number, etc."
                        maxLength={200}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <div className="mb-3">
                      <Form.Check
                        type="checkbox"
                        name="requirePreApproval"
                        checked={formData.requirePreApproval}
                        onChange={handleInputChange}
                        label="Require pre-approval for bidders"
                        className="mb-2"
                      />
                      {formData.requirePreApproval && (
                        <Form.Text className="text-muted d-block">
                          Bidders will need to be approved before they can place bids
                        </Form.Text>
                      )}
                    </div>
                  </Col>
                </Row>

                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={() => navigate('/')}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Creating Auction...' : 'Create Auction'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateAuction;
